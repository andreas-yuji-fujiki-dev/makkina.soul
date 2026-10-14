import type { DragEvent } from "react";
import type { Habit, HabitEntry, HabitGroup, WeekChecks } from "@app-types/rotina.types";
import { DAYS } from "@constants/rotina";
import { fmt, mondayOf } from "@utils/date";
import { isHabitGroup, todayIndex } from "@utils/rotina";

interface RotinaGridProps {
  entries: HabitEntry[];
  weekOffset: number;
  checks: WeekChecks;
  onToggle: (key: string, value: boolean) => void;
  onEditCategory: (category: HabitGroup) => void;
  onEditHabit: (habit: Habit) => void;
  onAddHabit: (category: HabitGroup) => void;
  draggedId: string | null;
  dropIndex: number | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverSlot: (index: number) => void;
  onDrop: () => void;
}

export function RotinaGrid({
  entries,
  weekOffset,
  checks,
  onToggle,
  onEditCategory,
  onEditHabit,
  onAddHabit,
  draggedId,
  dropIndex,
  onDragStart,
  onDragEnd,
  onDragOverSlot,
  onDrop,
}: RotinaGridProps) {
  const monday = mondayOf(weekOffset);
  const todayIdx = todayIndex(weekOffset);

  function handleRowDragOver(e: DragEvent<HTMLTableRowElement>, index: number) {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    onDragOverSlot(index + (after ? 1 : 0));
  }

  function handleTbodyDragOver(e: DragEvent<HTMLTableSectionElement>) {
    e.preventDefault();
    onDragOverSlot(entries.length);
  }

  function handleDrop(e: DragEvent<HTMLTableSectionElement>) {
    e.preventDefault();
    onDrop();
  }

  return (
    <div className="grid-wrap">
      <table>
        <thead>
          <tr>
            <th>Hábito</th>
            {DAYS.map((name, i) => {
              const day = new Date(monday);
              day.setDate(monday.getDate() + i);
              return (
                <th key={name} className={i === todayIdx ? "today" : undefined}>
                  {name}
                  <div>{fmt(day)}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody onDragOver={handleTbodyDragOver} onDrop={handleDrop}>
          {entries.map((entry, idx) => {
            const rowClass = [
              draggedId === entry.id ? "dragging" : null,
              dropIndex === idx ? "drag-over-top" : null,
              dropIndex === entries.length && idx === entries.length - 1 ? "drag-over-bottom" : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined;

            if (isHabitGroup(entry)) {
              return (
                <tr
                  className={["group", rowClass].filter(Boolean).join(" ")}
                  key={entry.id}
                  draggable
                  onDragStart={() => onDragStart(entry.id)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => handleRowDragOver(e, idx)}
                >
                  <td colSpan={8}>
                    <div className="group-row-head">
                      {entry.g}
                      <span>
                        <button type="button" className="edit-entry" onClick={() => onAddHabit(entry)}>
                          + item
                        </button>
                        <button type="button" className="edit-entry" onClick={() => onEditCategory(entry)}>
                          Editar
                        </button>
                      </span>
                    </div>
                  </td>
                </tr>
              );
            }
            return (
              <tr
                className={rowClass}
                key={entry.id}
                draggable
                onDragStart={() => onDragStart(entry.id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => handleRowDragOver(e, idx)}
              >
                <td className="habit">
                  <div className="habit-row-head">
                    <b>{entry.t}</b>
                    <button type="button" className="edit-entry" onClick={() => onEditHabit(entry)}>
                      Editar
                    </button>
                  </div>
                  {entry.s && <small>{entry.s}</small>}
                </td>
                {Array.from({ length: 7 }, (_, i) => {
                  const isToday = i === todayIdx;
                  if (!entry.d.includes(i as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
                    return (
                      <td key={i} className={isToday ? "today off" : "off"}>
                        ·
                      </td>
                    );
                  }
                  const key = `${entry.id}_${i}`;
                  return (
                    <td key={i} className={isToday ? "today" : undefined}>
                      <input
                        type="checkbox"
                        id={`c-${key}`}
                        checked={!!checks[key]}
                        aria-label={`${entry.t} ${DAYS[i]}`}
                        onChange={(e) => onToggle(key, e.target.checked)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
