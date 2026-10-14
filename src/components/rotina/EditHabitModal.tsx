import { useState } from "react";
import type { FormEvent } from "react";
import type { DayIndex, Habit } from "@app-types/rotina.types";
import { DAYS } from "@constants/rotina";
import { Modal } from "@components/layout/Modal";

export interface HabitEdits {
  title: string;
  note: string;
  days: DayIndex[];
}

interface EditHabitModalProps {
  habit: Habit;
  onSave: (edits: HabitEdits) => void;
  onClose: () => void;
}

export function EditHabitModal({ habit, onSave, onClose }: EditHabitModalProps) {
  const [title, setTitle] = useState(habit.t);
  const [note, setNote] = useState(habit.s);
  const [days, setDays] = useState<DayIndex[]>(habit.d);

  function toggleDay(day: DayIndex) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, note: note.trim(), days });
  }

  return (
    <Modal onClose={onClose} labelledBy="edit-habit-title">
      <h2 id="edit-habit-title">Editar hábito</h2>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label htmlFor="edit-habit-t">Título</label>
        <input
          id="edit-habit-t"
          value={title}
          maxLength={140}
          required
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="edit-habit-s">Descrição</label>
        <textarea
          id="edit-habit-s"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <span>Dias</span>
        <div className="day-picker">
          {DAYS.map((name, i) => (
            <label key={name}>
              <input
                type="checkbox"
                checked={days.includes(i as DayIndex)}
                onChange={() => toggleDay(i as DayIndex)}
              />
              {name}
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn" type="submit">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
