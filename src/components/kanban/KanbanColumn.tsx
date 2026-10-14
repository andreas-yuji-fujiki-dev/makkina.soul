import { useState } from "react";
import type { DragEvent } from "react";
import type { AreaCategory, Card, ColumnId, KanbanColumnDef, PriorityLevel } from "@app-types/kanban.types";
import { sortCardsInColumn } from "@utils/kanban";
import type { DropSlot } from "@hooks/useKanbanDrag";
import { KanbanCard } from "./KanbanCard";

const EMPTY_MESSAGE: Record<string, string> = {
  todo: "Nada aqui. Adicione uma tarefa acima.",
  doing: "Puxe cartões do topo de outra coluna.",
  done: "O que você terminar aparece aqui.",
};
const EMPTY_MESSAGE_FALLBACK = "Nada aqui ainda.";

interface KanbanColumnProps {
  column: KanbanColumnDef;
  columnIndex: number;
  cards: Card[];
  areas: AreaCategory[];
  priorities: PriorityLevel[];
  columns: KanbanColumnDef[];
  areaFilter: string;
  draggedId: string | null;
  dropSlot: DropSlot | null;
  onMove: (card: Card, col: ColumnId) => void;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  onDragStart: (card: Card) => void;
  onDragEnd: () => void;
  onDragOverSlot: (col: ColumnId, index: number) => void;
  onDrop: () => void;
  onRenameColumn: (id: string, label: string) => void;
  draggedColumnId: string | null;
  dropColumnIndex: number | null;
  onColumnDragStart: (id: string) => void;
  onColumnDragEnd: () => void;
  onColumnDragOverSlot: (index: number) => void;
  onColumnDrop: () => void;
}

export function KanbanColumn({
  column,
  columnIndex,
  cards,
  areas,
  priorities,
  columns,
  areaFilter,
  draggedId,
  dropSlot,
  onMove,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOverSlot,
  onDrop,
  onRenameColumn,
  draggedColumnId,
  dropColumnIndex,
  onColumnDragStart,
  onColumnDragEnd,
  onColumnDragOverSlot,
  onColumnDrop,
}: KanbanColumnProps) {
  const col = column.id;
  const [editingLabel, setEditingLabel] = useState<string | null>(null);

  const list = sortCardsInColumn(cards, col, areaFilter);
  const isFull = column.wipLimit != null && list.length >= column.wipLimit;

  function handleContainerDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    onDragOverSlot(col, list.length);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    onDrop();
  }

  function handleHeaderDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientX - rect.left > rect.width / 2;
    onColumnDragOverSlot(columnIndex + (after ? 1 : 0));
  }

  function handleHeaderDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    onColumnDrop();
  }

  function saveLabel() {
    const trimmed = editingLabel?.trim();
    if (trimmed) onRenameColumn(column.id, trimmed);
    setEditingLabel(null);
  }

  const classes = [
    "col",
    draggedColumnId === column.id ? "dragging-col" : null,
    dropColumnIndex === columnIndex ? "drop-before-col" : null,
    dropColumnIndex === columns.length && columnIndex === columns.length - 1 ? "drop-after-col" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-col={col}>
      <div
        className="col-head"
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          onColumnDragStart(column.id);
        }}
        onDragEnd={onColumnDragEnd}
        onDragOver={handleHeaderDragOver}
        onDrop={handleHeaderDrop}
      >
        {editingLabel !== null ? (
          <input
            autoFocus
            value={editingLabel}
            onChange={(e) => setEditingLabel(e.target.value)}
            onBlur={saveLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveLabel();
              if (e.key === "Escape") setEditingLabel(null);
            }}
          />
        ) : (
          <h2 onClick={() => setEditingLabel(column.label)} title="Clique para renomear">
            {column.label}
          </h2>
        )}
        <span className={isFull ? "full" : undefined}>
          {column.wipLimit != null ? `${list.length} de ${column.wipLimit}` : String(list.length)}
        </span>
      </div>
      {columnIndex === 0 && <p className="hint">Arraste para reordenar, ou pegue sempre o de cima.</p>}
      <div className="cards" onDragOver={handleContainerDragOver} onDrop={handleDrop}>
        {list.length === 0 ? (
          <div className="empty">{EMPTY_MESSAGE[col] ?? EMPTY_MESSAGE_FALLBACK}</div>
        ) : (
          list.map((card, i) => (
            <KanbanCard
              key={card.id}
              card={card}
              areas={areas}
              priorities={priorities}
              columns={columns}
              index={i}
              isDragging={draggedId === card.id}
              showDropIndicator={dropSlot?.col === col && dropSlot.index === i}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverSlot={onDragOverSlot}
            />
          ))
        )}
        {list.length > 0 && dropSlot?.col === col && dropSlot.index === list.length && (
          <div className="drop-indicator" />
        )}
      </div>
    </div>
  );
}
