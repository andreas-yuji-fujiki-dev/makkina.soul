import { useState } from "react";
import type { FormEvent } from "react";

interface AddCategoryFormProps {
  onAdd: (title: string) => void;
}

export function AddCategoryForm({ onAdd }: AddCategoryFormProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle("");
  }

  return (
    <form className="add" onSubmit={handleSubmit}>
      <input
        placeholder="Nova categoria (ex.: Fim de semana)"
        maxLength={60}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="btn" type="submit">
        Adicionar categoria
      </button>
    </form>
  );
}
