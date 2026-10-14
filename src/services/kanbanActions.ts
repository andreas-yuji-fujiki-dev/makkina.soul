import type { Area, Card, CardSeed, ColumnId, KanbanColumnDef, Priority } from "@app-types/kanban.types";
import { db } from "@services/db";
import { DEFAULT_AREA_FILTER } from "@constants/kanban";
import { COLUMNS } from "@constants/columns";
import { SERVER_URL } from "@constants/server";
import { appendOrder, betweenOrder, sortCardsInColumn } from "@utils/kanban";

export interface ActionOutcome {
  ok: boolean;
  error?: string;
}

async function getAllCards(): Promise<Card[]> {
  const snap = await db.collection<CardSeed>("cards").get();
  return snap.docs.map((d) => ({ ...(d.data() as CardSeed), id: d.id }));
}

// Colunas moram num arquivo estático lido pelo servidor (não no localStorage
// como os cartões) — buscamos de lá pra aplicar o limite de WIP certo e
// saber qual é a primeira coluna no momento (pode mudar se o usuário
// reordenar), com fallback pro seed estático se o servidor estiver fora.
async function getColumnsList(): Promise<KanbanColumnDef[]> {
  try {
    const res = await fetch(`${SERVER_URL}/api/kanban/columns`);
    if (!res.ok) throw new Error("status request failed");
    const data: { columns: KanbanColumnDef[] } = await res.json();
    return [...data.columns].sort((a, b) => a.order - b.order);
  } catch {
    return COLUMNS;
  }
}

function exceedsWipLimit(cards: Card[], card: Card, col: ColumnId, columns: KanbanColumnDef[]): boolean {
  const limit = columns.find((c) => c.id === col)?.wipLimit;
  if (limit == null) return false;
  const count = cards.filter((c) => c.col === col).length;
  return card.col !== col && count >= limit;
}

export async function addCardAction(input: { title: string; area: Area; prio: Priority }): Promise<ActionOutcome> {
  const [cards, columns] = await Promise.all([getAllCards(), getColumnsList()]);
  const firstCol = columns[0]?.id ?? "todo";
  const data: CardSeed = {
    title: input.title,
    note: "",
    area: input.area,
    prio: input.prio,
    col: firstCol,
    created: Date.now(),
    movedAt: Date.now(),
    order: appendOrder(cards, firstCol),
  };
  await db.collection<CardSeed>("cards").add(data);
  return { ok: true };
}

export async function updateCardAction(
  id: string,
  edits: Partial<Pick<Card, "title" | "note" | "area" | "prio">>,
): Promise<ActionOutcome> {
  const ref = db.doc<CardSeed>(`cards/${id}`);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: `Cartão ${id} não encontrado.` };
  await ref.update(edits);
  return { ok: true };
}

export async function moveCardAction(id: string, col: ColumnId): Promise<ActionOutcome> {
  const [cards, columns] = await Promise.all([getAllCards(), getColumnsList()]);
  const card = cards.find((c) => c.id === id);
  if (!card) return { ok: false, error: `Cartão ${id} não encontrado.` };
  if (exceedsWipLimit(cards, card, col, columns)) return { ok: false, error: "Limite de cartões dessa coluna atingido." };
  await db.doc<CardSeed>(`cards/${id}`).update({ col, movedAt: Date.now(), order: appendOrder(cards, col) });
  return { ok: true };
}

export async function reorderCardAction(
  id: string,
  col: ColumnId,
  beforeId?: string,
  afterId?: string,
): Promise<ActionOutcome> {
  const [cards, columns] = await Promise.all([getAllCards(), getColumnsList()]);
  const card = cards.find((c) => c.id === id);
  if (!card) return { ok: false, error: `Cartão ${id} não encontrado.` };
  if (exceedsWipLimit(cards, card, col, columns)) return { ok: false, error: "Limite de cartões dessa coluna atingido." };

  const siblings = sortCardsInColumn(cards, col, DEFAULT_AREA_FILTER).filter((c) => c.id !== id);
  const before = beforeId ? (siblings.find((c) => c.id === beforeId)?.order ?? null) : null;
  const after = afterId ? (siblings.find((c) => c.id === afterId)?.order ?? null) : null;

  await db.doc<CardSeed>(`cards/${id}`).update({
    col,
    order: betweenOrder(before, after),
    movedAt: col !== card.col ? Date.now() : card.movedAt,
  });
  return { ok: true };
}

export async function deleteCardAction(id: string): Promise<ActionOutcome> {
  await db.doc(`cards/${id}`).delete();
  return { ok: true };
}
