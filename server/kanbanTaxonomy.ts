import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AreaCategory, PriorityLevel } from "../src/@types/kanban.types";

const DIR = dirname(fileURLToPath(import.meta.url));
const AREAS_PATH = resolve(DIR, "../src/constants/areasData.json");
const PRIORITIES_PATH = resolve(DIR, "../src/constants/prioritiesData.json");

export interface ActionOutcome {
  ok: boolean;
  error?: string;
}

function appendOrder<T extends { order: number }>(list: T[]): number {
  return list.length ? Math.max(...list.map((e) => e.order)) + 1000 : 1000;
}

function genId(): string {
  return `area-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function readAreas(): AreaCategory[] {
  return JSON.parse(readFileSync(AREAS_PATH, "utf8")) as AreaCategory[];
}

function writeAreas(areas: AreaCategory[]): void {
  writeFileSync(AREAS_PATH, `${JSON.stringify(areas, null, 2)}\n`, "utf8");
}

function readPriorities(): PriorityLevel[] {
  return JSON.parse(readFileSync(PRIORITIES_PATH, "utf8")) as PriorityLevel[];
}

function writePriorities(priorities: PriorityLevel[]): void {
  writeFileSync(PRIORITIES_PATH, `${JSON.stringify(priorities, null, 2)}\n`, "utf8");
}

export function getTaxonomy(): { areas: AreaCategory[]; priorities: PriorityLevel[] } {
  return { areas: readAreas(), priorities: readPriorities() };
}

export function addArea(label: string, defaultPrio: number): ActionOutcome {
  const areas = readAreas();
  const area: AreaCategory = { id: genId(), label, order: appendOrder(areas), defaultPrio };
  writeAreas([...areas, area]);
  return { ok: true };
}

export function updateArea(id: string, edits: { label?: string; defaultPrio?: number }): ActionOutcome {
  const areas = readAreas();
  const idx = areas.findIndex((a) => a.id === id);
  if (idx === -1) return { ok: false, error: `Categoria ${id} não encontrada.` };
  const next = [...areas];
  next[idx] = {
    ...next[idx],
    label: edits.label ?? next[idx].label,
    defaultPrio: edits.defaultPrio ?? next[idx].defaultPrio,
  };
  writeAreas(next);
  return { ok: true };
}

export function deleteArea(id: string): ActionOutcome {
  const areas = readAreas();
  if (!areas.some((a) => a.id === id)) return { ok: false, error: `Categoria ${id} não encontrada.` };
  writeAreas(areas.filter((a) => a.id !== id));
  return { ok: true };
}

export function addPriority(label: string): ActionOutcome {
  const priorities = readPriorities();
  const nextId = priorities.length ? Math.max(...priorities.map((p) => p.id)) + 1 : 1;
  const priority: PriorityLevel = { id: nextId, label, order: appendOrder(priorities) };
  writePriorities([...priorities, priority]);
  return { ok: true };
}

export function updatePriority(id: number, label: string): ActionOutcome {
  const priorities = readPriorities();
  const idx = priorities.findIndex((p) => p.id === id);
  if (idx === -1) return { ok: false, error: `Prioridade ${id} não encontrada.` };
  const next = [...priorities];
  next[idx] = { ...next[idx], label };
  writePriorities(next);
  return { ok: true };
}

export function deletePriority(id: number): ActionOutcome {
  const priorities = readPriorities();
  if (!priorities.some((p) => p.id === id)) return { ok: false, error: `Prioridade ${id} não encontrada.` };
  writePriorities(priorities.filter((p) => p.id !== id));
  return { ok: true };
}
