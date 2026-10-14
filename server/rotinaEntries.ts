import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { DayIndex, Habit, HabitEntry, HabitGroup } from "../src/@types/rotina.types";

const DATA_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/constants/rotinaData.json");

export interface ActionOutcome {
  ok: boolean;
  error?: string;
}

function isHabitGroup(entry: HabitEntry): entry is HabitGroup {
  return "g" in entry;
}

function appendOrder(entries: HabitEntry[]): number {
  return entries.length ? Math.max(...entries.map((e) => e.order)) + 1000 : 1000;
}

function betweenOrder(before: number | null, after: number | null): number {
  if (before == null && after == null) return 1000;
  if (before == null) return (after as number) / 2;
  if (after == null) return before + 1000;
  return (before + after) / 2;
}

/** `count` valores de order igualmente espaçados entre `before` e `after`,
 * preservando a ordem entre si — generaliza betweenOrder pra mover vários
 * itens de uma vez (ex.: uma categoria e os hábitos dela) mantendo a ordem
 * relativa que já tinham. */
function spreadOrders(before: number | null, after: number | null, count: number): number[] {
  if (count === 0) return [];
  if (before == null && after == null) {
    return Array.from({ length: count }, (_, i) => (i + 1) * 1000);
  }
  if (before == null) {
    const step = (after as number) / (count + 1);
    return Array.from({ length: count }, (_, i) => step * (i + 1));
  }
  if (after == null) {
    return Array.from({ length: count }, (_, i) => before + (i + 1) * 1000);
  }
  const step = (after - before) / (count + 1);
  return Array.from({ length: count }, (_, i) => before + step * (i + 1));
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Order pra inserir um item novo logo depois de `afterId`, ou no fim da lista se omitido/não encontrado. */
function insertOrder(entries: HabitEntry[], afterId?: string): number {
  if (!afterId) return appendOrder(entries);
  const sorted = [...entries].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((e) => e.id === afterId);
  if (idx === -1) return appendOrder(entries);
  return betweenOrder(sorted[idx].order, sorted[idx + 1]?.order ?? null);
}

function readEntries(): HabitEntry[] {
  return JSON.parse(readFileSync(DATA_PATH, "utf8")) as HabitEntry[];
}

// Reescreve o arquivo inteiro a cada edição — é o próprio código-fonte
// versionado do app (src/constants/rotinaData.json), não um banco.
function writeEntries(entries: HabitEntry[]): void {
  writeFileSync(DATA_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

export function getEntries(): HabitEntry[] {
  return readEntries();
}

export function addHabit(input: { title: string; note?: string; days: DayIndex[]; afterId?: string }): ActionOutcome {
  const entries = readEntries();
  const habit: Habit = {
    id: genId("habit"),
    t: input.title,
    s: input.note ?? "",
    d: input.days,
    order: insertOrder(entries, input.afterId),
  };
  writeEntries([...entries, habit]);
  return { ok: true };
}

export function updateHabit(
  id: string,
  edits: { title?: string; note?: string; days?: DayIndex[] },
): ActionOutcome {
  const entries = readEntries();
  const idx = entries.findIndex((e) => e.id === id && !isHabitGroup(e));
  if (idx === -1) return { ok: false, error: `Hábito ${id} não encontrado.` };
  const habit = entries[idx] as Habit;
  const next = [...entries];
  next[idx] = {
    ...habit,
    t: edits.title ?? habit.t,
    s: edits.note ?? habit.s,
    d: edits.days ?? habit.d,
  };
  writeEntries(next);
  return { ok: true };
}

export function deleteHabit(id: string): ActionOutcome {
  const entries = readEntries();
  if (!entries.some((e) => e.id === id && !isHabitGroup(e))) {
    return { ok: false, error: `Hábito ${id} não encontrado.` };
  }
  writeEntries(entries.filter((e) => e.id !== id));
  return { ok: true };
}

export function addCategory(title: string, afterId?: string): ActionOutcome {
  const entries = readEntries();
  const group: HabitGroup = { id: genId("grp"), g: title, order: insertOrder(entries, afterId) };
  writeEntries([...entries, group]);
  return { ok: true };
}

export function updateCategory(id: string, title: string): ActionOutcome {
  const entries = readEntries();
  const idx = entries.findIndex((e) => e.id === id && isHabitGroup(e));
  if (idx === -1) return { ok: false, error: `Categoria ${id} não encontrada.` };
  const next = [...entries];
  next[idx] = { ...(next[idx] as HabitGroup), g: title };
  writeEntries(next);
  return { ok: true };
}

export function reorderEntry(id: string, beforeId?: string, afterId?: string): ActionOutcome {
  const entries = readEntries();
  const sorted = [...entries].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((e) => e.id === id);
  if (idx === -1) return { ok: false, error: `Item ${id} não encontrado.` };

  // Arrastar uma categoria leva junto os hábitos que vêm logo depois dela,
  // até a próxima categoria (ou o fim da lista) — eles não têm vínculo de
  // dado nenhum com ela, é puramente a posição no array que os agrupa.
  const blockIds = [id];
  if (isHabitGroup(sorted[idx])) {
    for (let i = idx + 1; i < sorted.length && !isHabitGroup(sorted[i]); i++) {
      blockIds.push(sorted[i].id);
    }
  }
  const blockSet = new Set(blockIds);

  const siblings = sorted.filter((e) => !blockSet.has(e.id));
  // Se beforeId/afterId caírem dentro do próprio bloco (ex.: soltou entre a
  // categoria e um hábito dela), trata como se não tivessem sido informados.
  const before = beforeId ? siblings.find((e) => e.id === beforeId)?.order ?? null : null;
  const after = afterId ? siblings.find((e) => e.id === afterId)?.order ?? null : null;

  const newOrders = spreadOrders(before, after, blockIds.length);
  const orderById = new Map(blockIds.map((bid, i) => [bid, newOrders[i]]));

  const next = entries.map((e) => (orderById.has(e.id) ? { ...e, order: orderById.get(e.id) as number } : e));
  writeEntries(next);
  return { ok: true };
}
