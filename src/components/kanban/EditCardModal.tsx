import { useState } from "react";
import type { FormEvent } from "react";
import type { Area, AreaCategory, Card, Priority, PriorityLevel } from "@app-types/kanban.types";
import { Modal } from "@components/layout/Modal";

export interface CardEdits {
  title: string;
  note: string;
  area: Area;
  prio: Priority;
}

interface EditCardModalProps {
  card: Card;
  areas: AreaCategory[];
  priorities: PriorityLevel[];
  onSave: (edits: CardEdits) => void;
  onClose: () => void;
}

export function EditCardModal({ card, areas, priorities, onSave, onClose }: EditCardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [note, setNote] = useState(card.note);
  const [area, setArea] = useState<Area>(card.area);
  const [prio, setPrio] = useState<Priority>(card.prio);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, note: note.trim(), area, prio });
  }

  return (
    <Modal onClose={onClose} labelledBy="edit-card-title">
      <h2 id="edit-card-title">Editar cartão</h2>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label htmlFor="edit-title">Título</label>
        <input
          id="edit-title"
          value={title}
          maxLength={140}
          required
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="edit-note">Nota</label>
        <textarea
          id="edit-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="modal-row">
          <div>
            <label htmlFor="edit-area">Área</label>
            <select id="edit-area" value={area} onChange={(e) => setArea(e.target.value)}>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-prio">Prioridade</label>
            <select
              id="edit-prio"
              value={prio}
              onChange={(e) => setPrio(Number(e.target.value))}
            >
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
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
