import { useEffect, useState } from "react";
import type { DragEvent } from "react";
import type { Card } from "@app-types/kanban.types";
import { DEFAULT_AREA_FILTER } from "@constants/kanban";
import { useCards } from "@hooks/useCards";
import { useAreaFilter } from "@hooks/useAreaFilter";
import { useAutoScroll } from "@hooks/useAutoScroll";
import { useDragReorder } from "@hooks/useDragReorder";
import { useKanbanColumns } from "@hooks/useKanbanColumns";
import { useKanbanDrag } from "@hooks/useKanbanDrag";
import { useKanbanTaxonomy } from "@hooks/useKanbanTaxonomy";
import { visibleAreaFilters } from "@utils/kanban";
import { ConfirmModal } from "@components/layout/ConfirmModal";
import { AddCardForm } from "./AddCardForm";
import { AddColumnForm } from "./AddColumnForm";
import { AreaFilters } from "./AreaFilters";
import { KanbanColumn } from "./KanbanColumn";
import { EditCardModal } from "./EditCardModal";
import { ManageTaxonomyModal } from "./ManageTaxonomyModal";
import "@styles/kanban.css";

interface KanbanViewProps {
  showNotice: (text: string) => void;
}

export function KanbanView({ showNotice }: KanbanViewProps) {
  const { columns, addColumn, updateColumn, reorderColumn } = useKanbanColumns(showNotice);
  const { cards, addCard, moveCard, reorderCard, updateCard, removeCard } = useCards(showNotice, columns);
  const {
    areas,
    priorities,
    addArea,
    updateArea,
    deleteArea,
    addPriority,
    updatePriority,
    deletePriority,
  } = useKanbanTaxonomy(showNotice);
  const { areaFilter, setAreaFilter } = useAreaFilter();
  const { draggedId, dropSlot, handleDragStart, handleDragEnd, handleDragOverSlot, handleDrop } =
    useKanbanDrag(cards, areaFilter, reorderCard);
  const {
    draggedId: draggedColumnId,
    dropIndex: dropColumnIndex,
    handleDragStart: handleColumnDragStart,
    handleDragEnd: handleColumnDragEnd,
    handleDragOverSlot: handleColumnDragOverSlot,
    handleDrop: handleColumnDrop,
  } = useDragReorder(columns, reorderColumn);
  useAutoScroll(!!draggedId);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);
  const [managingTaxonomy, setManagingTaxonomy] = useState(false);

  useEffect(() => {
    const options = visibleAreaFilters(cards, areas);
    if (!options.some((o) => o.area === areaFilter)) setAreaFilter(DEFAULT_AREA_FILTER);
  }, [cards, areas, areaFilter, setAreaFilter]);

  function handleBoardDragOver(e: DragEvent<HTMLDivElement>) {
    if (!draggedColumnId) return;
    e.preventDefault();
    handleColumnDragOverSlot(columns.length);
  }

  function handleBoardDrop(e: DragEvent<HTMLDivElement>) {
    if (!draggedColumnId) return;
    e.preventDefault();
    handleColumnDrop();
  }

  return (
    <section
      id="view-kanban"
      role="tabpanel"
      aria-labelledby="tab-kanban"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <AddCardForm areas={areas} priorities={priorities} onAdd={addCard} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <AreaFilters cards={cards} areas={areas} active={areaFilter} onChange={setAreaFilter} />
        <button type="button" onClick={() => setManagingTaxonomy(true)}>
          Categorias e prioridades
        </button>
      </div>
      <AddColumnForm onAdd={addColumn} />
      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        onDragOver={handleBoardDragOver}
        onDrop={handleBoardDrop}
      >
        {columns.map((column, i) => (
          <KanbanColumn
            key={column.id}
            column={column}
            columnIndex={i}
            columns={columns}
            cards={cards}
            areas={areas}
            priorities={priorities}
            areaFilter={areaFilter}
            draggedId={draggedId}
            dropSlot={dropSlot}
            onMove={moveCard}
            onEdit={setEditingCard}
            onDelete={setDeletingCard}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOverSlot={handleDragOverSlot}
            onDrop={handleDrop}
            onRenameColumn={updateColumn}
            draggedColumnId={draggedColumnId}
            dropColumnIndex={dropColumnIndex}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragEnd={handleColumnDragEnd}
            onColumnDragOverSlot={handleColumnDragOverSlot}
            onColumnDrop={handleColumnDrop}
          />
        ))}
      </div>

      {editingCard && (
        <EditCardModal
          card={editingCard}
          areas={areas}
          priorities={priorities}
          onClose={() => setEditingCard(null)}
          onSave={(edits) => {
            updateCard(editingCard, edits);
            setEditingCard(null);
          }}
        />
      )}

      {deletingCard && (
        <ConfirmModal
          title="Excluir cartão?"
          message={`"${deletingCard.title}" será removido permanentemente.`}
          confirmLabel="Excluir"
          danger
          onCancel={() => setDeletingCard(null)}
          onConfirm={() => {
            removeCard(deletingCard);
            setDeletingCard(null);
          }}
        />
      )}

      {managingTaxonomy && (
        <ManageTaxonomyModal
          cards={cards}
          areas={areas}
          priorities={priorities}
          onAddArea={addArea}
          onUpdateArea={updateArea}
          onDeleteArea={deleteArea}
          onAddPriority={addPriority}
          onUpdatePriority={updatePriority}
          onDeletePriority={deletePriority}
          onClose={() => setManagingTaxonomy(false)}
          showNotice={showNotice}
        />
      )}
    </section>
  );
}
