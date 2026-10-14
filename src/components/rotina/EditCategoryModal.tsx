import { useState } from "react";
import type { FormEvent } from "react";
import type { HabitGroup } from "@app-types/rotina.types";
import { Modal } from "@components/layout/Modal";

interface EditCategoryModalProps {
  category: HabitGroup;
  onSave: (title: string) => void;
  onClose: () => void;
}

export function EditCategoryModal({ category, onSave, onClose }: EditCategoryModalProps) {
  const [title, setTitle] = useState(category.g);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed);
  }

  return (
    <Modal onClose={onClose} labelledBy="edit-category-title">
      <h2 id="edit-category-title">Editar categoria</h2>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label htmlFor="edit-category-g">Nome</label>
        <input
          id="edit-category-g"
          value={title}
          maxLength={60}
          required
          onChange={(e) => setTitle(e.target.value)}
        />

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
