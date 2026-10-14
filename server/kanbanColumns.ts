import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { KanbanColumnDef } from "../src/@types/kanban.types";

const DATA_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/constants/columnsData.json");

export interface ActionOutcome {
  ok: boolean;
  error?: string;
}

function appendOrder(columns: KanbanColumnDef[]): number {
  return columns.length ? Math.max(...columns.map((c) => c.order)) + 1000 : 1000;
}

function betweenOrder(before: number | null, after: number | null): number {
  if (before == null && after == null) return 1000;
  if (before == null) return (after as number) / 2;
  if (after == null) return before + 1000;
  return (before + after) / 2;
}

function genId(): string {
  return `col-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function readColumns(): KanbanColumnDef[] {
  return JSON.parse(readFileSync(DATA_PATH, "utf8")) as KanbanColumnDef[];
}

function writeColumns(columns: KanbanColumnDef[]): void {
  writeFileSync(DATA_PATH, `${JSON.stringify(columns, null, 2)}\n`, "utf8");
}

export function getColumns(): KanbanColumnDef[] {
  return readColumns();
}

export function addColumn(label: string): ActionOutcome {
  const columns = readColumns();
  const column: KanbanColumnDef = { id: genId(), label, order: appendOrder(columns) };
  writeColumns([...columns, column]);
  return { ok: true };
}

export function updateColumn(id: string, label: string): ActionOutcome {
  const columns = readColumns();
  const idx = columns.findIndex((c) => c.id === id);
  if (idx === -1) return { ok: false, error: `Coluna ${id} não encontrada.` };
  const next = [...columns];
  next[idx] = { ...next[idx], label };
  writeColumns(next);
  return { ok: true };
}

export function reorderColumn(id: string, beforeId?: string, afterId?: string): ActionOutcome {
  const columns = readColumns();
  if (!columns.some((c) => c.id === id)) return { ok: false, error: `Coluna ${id} não encontrada.` };

  const siblings = columns.filter((c) => c.id !== id).sort((a, b) => a.order - b.order);
  const before = beforeId ? siblings.find((c) => c.id === beforeId)?.order ?? null : null;
  const after = afterId ? siblings.find((c) => c.id === afterId)?.order ?? null : null;

  const next = columns.map((c) => (c.id === id ? { ...c, order: betweenOrder(before, after) } : c));
  writeColumns(next);
  return { ok: true };
}
