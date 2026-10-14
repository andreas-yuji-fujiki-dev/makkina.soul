import { useState } from "react";
import type { FormEvent } from "react";
import type { Area, AreaCategory, Priority, PriorityLevel } from "@app-types/kanban.types";

interface AddCardFormProps {
  areas: AreaCategory[];
  priorities: PriorityLevel[];
  onAdd: (input: { title: string; area: Area; prio: Priority }) => void;
}

export function AddCardForm({ areas, priorities, onAdd }: AddCardFormProps) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<Area>(areas[0]?.id ?? "");
  const [prio, setPrio] = useState<Priority>(areas[0]?.defaultPrio ?? priorities[0]?.id ?? 1);

  function handleAreaChange(next: Area) {
    setArea(next);
    const found = areas.find((a) => a.id === next);
    if (found) setPrio(found.defaultPrio);
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({ title: trimmed, area, prio });
    setTitle("");
  }

  return (
    <form className="add" onSubmit={handleSubmit}>
      <input
        id="f-title"
        placeholder="Nova tarefa (ex.: mandar currículo pra vaga X)"
        maxLength={140}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select aria-label="Área" value={area} onChange={(e) => handleAreaChange(e.target.value)}>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Prioridade"
        value={prio}
        onChange={(e) => setPrio(Number(e.target.value))}
      >
        {priorities.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <button className="btn" type="submit">
        Adicionar
      </button>
    </form>
  );
}
