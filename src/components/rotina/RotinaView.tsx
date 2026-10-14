import { useCallback, useMemo, useState } from "react";
import type { Habit, HabitGroup } from "@app-types/rotina.types";
import { useAutoScroll } from "@hooks/useAutoScroll";
import { useDragReorder } from "@hooks/useDragReorder";
import { useHabits } from "@hooks/useHabits";
import { useWeek } from "@hooks/useWeek";
import { fmt, mondayOf } from "@utils/date";
import { countChecks, isHabitGroup, realHabits } from "@utils/rotina";
import { AddCategoryForm } from "./AddCategoryForm";
import { AddHabitModal } from "./AddHabitModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { EditHabitModal } from "./EditHabitModal";
import { RotinaGrid } from "./RotinaGrid";
import "@styles/rotina.css";

interface RotinaViewProps {
  showNotice: (text: string) => void;
}

export function RotinaView({ showNotice }: RotinaViewProps) {
  const { entries, updateHabit, updateCategory, addHabit, addCategory, reorderEntry } = useHabits(showNotice);
  const { weekOffset, checks, toggle, prevWeek, nextWeek } = useWeek(showNotice);
  const { draggedId, dropIndex, handleDragStart, handleDragEnd, handleDragOverSlot, handleDrop } = useDragReorder(
    entries,
    reorderEntry,
  );
  useAutoScroll(!!draggedId);

  // Arrastar uma categoria leva os hábitos dela junto (ver server/rotinaEntries.ts),
  // então só faz sentido soltar em divisas entre categorias — nunca no meio
  // dos hábitos de uma categoria diferente, o que quebraria o agrupamento dela.
  const draggedEntry = draggedId ? entries.find((e) => e.id === draggedId) : undefined;
  const draggedIsCategory = !!draggedEntry && isHabitGroup(draggedEntry);
  const categoryBoundaries = useMemo(() => {
    const bounds = [0, entries.length];
    entries.forEach((e, i) => {
      if (isHabitGroup(e)) bounds.push(i);
    });
    return bounds;
  }, [entries]);

  const handleDragOverSlotForRotina = useCallback(
    (index: number) => {
      if (!draggedIsCategory) {
        handleDragOverSlot(index);
        return;
      }
      const nearest = categoryBoundaries.reduce((best, b) =>
        Math.abs(b - index) < Math.abs(best - index) ? b : best,
      );
      handleDragOverSlot(nearest);
    },
    [draggedIsCategory, categoryBoundaries, handleDragOverSlot],
  );
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingCategory, setEditingCategory] = useState<HabitGroup | null>(null);
  const [addingHabitFor, setAddingHabitFor] = useState<HabitGroup | null>(null);
  const monday = mondayOf(weekOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const { done, total } = countChecks(realHabits(entries), checks);

  return (
    <section
      id="view-rotina"
      role="tabpanel"
      aria-labelledby="tab-rotina"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div className="week-nav">
        <button type="button" aria-label="Semana anterior" onClick={prevWeek}>
          ←
        </button>
        <h2>
          {weekOffset === 0 ? "Esta semana · " : ""}
          {fmt(monday)} a {fmt(sunday)}
        </h2>
        <button type="button" aria-label="Próxima semana" onClick={nextWeek}>
          →
        </button>
        <span className="score">
          {done} de {total} feitos
        </span>
      </div>
      <AddCategoryForm onAdd={addCategory} />
      <RotinaGrid
        entries={entries}
        weekOffset={weekOffset}
        checks={checks}
        onToggle={toggle}
        onEditCategory={setEditingCategory}
        onEditHabit={setEditingHabit}
        onAddHabit={setAddingHabitFor}
        draggedId={draggedId}
        dropIndex={dropIndex}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOverSlot={handleDragOverSlotForRotina}
        onDrop={handleDrop}
      />

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={(edits) => {
            updateHabit(editingHabit.id, edits);
            setEditingHabit(null);
          }}
        />
      )}

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={(title) => {
            updateCategory(editingCategory.id, title);
            setEditingCategory(null);
          }}
        />
      )}

      {addingHabitFor && (
        <AddHabitModal
          categoryTitle={addingHabitFor.g}
          onClose={() => setAddingHabitFor(null)}
          onAdd={(input) => {
            addHabit(input, addingHabitFor.id);
            setAddingHabitFor(null);
          }}
        />
      )}
    </section>
  );
}
