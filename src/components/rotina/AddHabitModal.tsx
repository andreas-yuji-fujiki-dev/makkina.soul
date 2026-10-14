import { useState } from "react";
import type { FormEvent } from "react";
import type { DayIndex } from "@app-types/rotina.types";
import { DAYS } from "@constants/rotina";
import { Modal } from "@components/layout/Modal";
import type { HabitEdits } from "./EditHabitModal";

interface AddHabitModalProps {
  categoryTitle: string;
  onAdd: (input: HabitEdits) => void;
  onClose: () => void;
}

export function AddHabitModal({ categoryTitle, onAdd, onClose }: AddHabitModalProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [days, setDays] = useState<DayIndex[]>([0, 1, 2, 3, 4, 5, 6]);

  function toggleDay(day: DayIndex) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({ title: trimmed, note: note.trim(), days });
  }

  return (
    <Modal onClose={onClose} labelledBy="add-habit-title">
      <h2 id="add-habit-title">Novo hábito em "{categoryTitle}"</h2>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label htmlFor="add-habit-t">Título</label>
        <input
          id="add-habit-t"
          placeholder="Ex.: Ler 10 minutos"
          value={title}
          maxLength={140}
          required
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="add-habit-s">Descrição</label>
        <textarea
          id="add-habit-s"
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
            Adicionar
          </button>
        </div>
      </form>
    </Modal>
  );
}
