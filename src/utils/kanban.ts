import type { AreaCategory, Card, ColumnId, Priority, PriorityLevel } from "@app-types/kanban.types";
import { DEFAULT_AREA_FILTER } from "@constants/kanban";

export function sortCardsInColumn(cards: Card[], col: ColumnId, areaFilter: string): Card[] {
  const list = cards.filter(
    (c) => c.col === col && (col === "doing" || areaFilter === DEFAULT_AREA_FILTER || c.area === areaFilter),
  );
  return [...list].sort((a, b) => a.order - b.order);
}

/** Próximo valor de order para inserir um cartão no fim da coluna. */
export function appendOrder(cards: Card[], col: ColumnId): number {
  const inCol = cards.filter((c) => c.col === col);
  return inCol.length ? Math.max(...inCol.map((c) => c.order)) + 1000 : 1000;
}

/** Valor de order para inserir um cartão entre dois vizinhos (drag and drop). */
export function betweenOrder(before: number | null, after: number | null): number {
  if (before == null && after == null) return 1000;
  if (before == null) return (after as number) / 2;
  if (after == null) return before + 1000;
  return (before + after) / 2;
}

export interface AreaFilterOption {
  area: string;
  label: string;
  count: number;
}

export function visibleAreaFilters(cards: Card[], areas: AreaCategory[]): AreaFilterOption[] {
  const openCards = cards.filter((c) => c.col !== "done");
  const options: AreaFilterOption[] = [
    { area: DEFAULT_AREA_FILTER, label: DEFAULT_AREA_FILTER, count: openCards.length },
  ];
  areas.forEach((area) => {
    const count = openCards.filter((c) => c.area === area.id).length;
    if (count > 0) options.push({ area: area.id, label: area.label, count });
  });
  return options;
}

/** Posição da prioridade na lista ordenada, de 1 a 4 — usada pra colorir o
 * cartão sem depender do id numérico exato (que pode ser qualquer inteiro
 * depois que o usuário cria/exclui níveis de prioridade). */
export function prioRank(priorities: PriorityLevel[], prio: Priority): number {
  const idx = priorities.findIndex((p) => p.id === prio);
  return idx === -1 ? 4 : Math.min(idx + 1, 4);
}
