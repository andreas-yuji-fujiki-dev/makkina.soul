import type { DragEvent } from "react";
import type { AreaCategory, Card, ColumnId, KanbanColumnDef, PriorityLevel } from "@app-types/kanban.types";
import { prioRank } from "@utils/kanban";

interface KanbanCardProps {
  card: Card;
  areas: AreaCategory[];
  priorities: PriorityLevel[];
  columns: KanbanColumnDef[];
  index: number;
  isDragging: boolean;
  showDropIndicator: boolean;
  onMove: (card: Card, col: ColumnId) => void;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  onDragStart: (card: Card) => void;
  onDragEnd: () => void;
  onDragOverSlot: (col: ColumnId, index: number) => void;
}

export function KanbanCard({
  card,
  areas,
  priorities,
  columns,
  index,
  isDragging,
  showDropIndicator,
  onMove,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOverSlot,
}: KanbanCardProps) {
  const colIndex = columns.findIndex((c) => c.id === card.col);
  const nextCol = colIndex !== -1 ? columns[colIndex + 1] : undefined;
  const areaLabel = areas.find((a) => a.id === card.area)?.label ?? card.area;
  const prioLabel = priorities.find((p) => p.id === card.prio)?.label ?? `P${card.prio}`;

  function handleDragOver(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    onDragOverSlot(card.col, index + (after ? 1 : 0));
  }

  return (
    <>
      {showDropIndicator && <div className="drop-indicator" />}
      <article
        className={isDragging ? "card dragging" : "card"}
        data-p={prioRank(priorities, card.prio)}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", card.id);
          onDragStart(card);
        }}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="meta">
          <span className="pr">{prioLabel}</span>
          <span>{areaLabel}</span>
        </div>
        <b>{card.title}</b>
        {card.note && <small>{card.note}</small>}
        <div className="actions">
          <button type="button" className="del" onClick={() => onDelete(card)}>
            Excluir
          </button>
          {nextCol && (
            <button type="button" onClick={() => onMove(card, nextCol.id)}>
              {colIndex + 2 === columns.length ? "Concluir ✓" : "Avançar →"}
            </button>
          )}
          <button type="button" className="edit" onClick={() => onEdit(card)}>
            Editar
          </button>
        </div>
      </article>
    </>
  );
}
