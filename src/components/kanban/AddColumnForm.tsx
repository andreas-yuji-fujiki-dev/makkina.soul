import { useState } from "react";
import type { FormEvent } from "react";

interface AddColumnFormProps {
  onAdd: (label: string) => void;
}

export function AddColumnForm({ onAdd }: AddColumnFormProps) {
  const [label, setLabel] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setLabel("");
  }

  return (
    <form className="add" onSubmit={handleSubmit}>
      <input
        placeholder="Nova coluna (ex.: Em revisão)"
        maxLength={40}
        required
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <button className="btn" type="submit">
        Adicionar coluna
      </button>
    </form>
  );
}
