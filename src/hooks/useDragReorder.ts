import { useCallback, useState } from "react";

type ReorderFn = (id: string, beforeId?: string, afterId?: string) => void;

/** Drag-and-drop genérico pra reordenar qualquer lista plana de itens com
 * id — usado tanto pelos itens da rotina quanto pelas colunas do kanban. */
export function useDragReorder<T extends { id: string }>(items: T[], reorder: ReorderFn) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((id: string) => setDraggedId(id), []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropIndex(null);
  }, []);

  const handleDragOverSlot = useCallback((index: number) => {
    setDropIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleDrop = useCallback(() => {
    if (!draggedId || dropIndex == null) return;

    // dropIndex foi calculado sobre a lista completa (com o item arrastado
    // ainda nela). Removendo esse item pra achar os vizinhos, todo índice
    // depois da posição original dele precisa recuar 1.
    const draggedIndex = items.findIndex((e) => e.id === draggedId);
    const targetIndex = draggedIndex !== -1 && draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;

    const siblings = items.filter((e) => e.id !== draggedId);
    const before = siblings[targetIndex - 1]?.id;
    const after = siblings[targetIndex]?.id;
    reorder(draggedId, before, after);
  }, [draggedId, dropIndex, items, reorder]);

  return { draggedId, dropIndex, handleDragStart, handleDragEnd, handleDragOverSlot, handleDrop };
}
