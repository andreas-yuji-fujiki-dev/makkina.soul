import { useCallback, useState } from "react";
import type { Card, ColumnId } from "@app-types/kanban.types";
import { sortCardsInColumn } from "@utils/kanban";

export interface DropSlot {
  col: ColumnId;
  index: number;
}

type ReorderFn = (card: Card, col: ColumnId, beforeOrder: number | null, afterOrder: number | null) => void;

export function useKanbanDrag(cards: Card[], areaFilter: string, reorderCard: ReorderFn) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropSlot, setDropSlot] = useState<DropSlot | null>(null);

  const handleDragStart = useCallback((card: Card) => setDraggedId(card.id), []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropSlot(null);
  }, []);

  const handleDragOverSlot = useCallback((col: ColumnId, index: number) => {
    setDropSlot((prev) => (prev && prev.col === col && prev.index === index ? prev : { col, index }));
  }, []);

  const handleDrop = useCallback(() => {
    if (!draggedId || !dropSlot) return;
    const card = cards.find((c) => c.id === draggedId);
    if (!card) return;

    // dropSlot.index foi calculado sobre a lista completa (com o cartão arrastado
    // ainda nela). Ao remover esse cartão para achar os vizinhos, todo índice
    // depois da posição original dele precisa recuar 1 — senão o alvo "logo
    // acima do próximo cartão" vira "logo abaixo dele" e troca os dois de lugar.
    const fullList = sortCardsInColumn(cards, dropSlot.col, areaFilter);
    const draggedIndex = fullList.findIndex((c) => c.id === draggedId);
    const targetIndex = draggedIndex !== -1 && draggedIndex < dropSlot.index ? dropSlot.index - 1 : dropSlot.index;

    const siblings = fullList.filter((c) => c.id !== draggedId);
    const before = siblings[targetIndex - 1]?.order ?? null;
    const after = siblings[targetIndex]?.order ?? null;
    reorderCard(card, dropSlot.col, before, after);
  }, [draggedId, dropSlot, cards, areaFilter, reorderCard]);

  return { draggedId, dropSlot, handleDragStart, handleDragEnd, handleDragOverSlot, handleDrop };
}
