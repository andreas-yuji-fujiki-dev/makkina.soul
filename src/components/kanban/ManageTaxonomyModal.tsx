import { useState } from "react";
import type { FormEvent } from "react";
import type { AreaCategory, Card, Priority, PriorityLevel } from "@app-types/kanban.types";
import { Modal } from "@components/layout/Modal";

interface ManageTaxonomyModalProps {
  cards: Card[];
  areas: AreaCategory[];
  priorities: PriorityLevel[];
  onAddArea: (label: string, defaultPrio: Priority) => void;
  onUpdateArea: (id: string, edits: { label?: string; defaultPrio?: Priority }) => void;
  onDeleteArea: (id: string) => void;
  onAddPriority: (label: string) => void;
  onUpdatePriority: (id: Priority, label: string) => void;
  onDeletePriority: (id: Priority) => void;
  onClose: () => void;
  showNotice: (text: string) => void;
}

export function ManageTaxonomyModal({
  cards,
  areas,
  priorities,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
  onAddPriority,
  onUpdatePriority,
  onDeletePriority,
  onClose,
  showNotice,
}: ManageTaxonomyModalProps) {
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [areaLabelDraft, setAreaLabelDraft] = useState("");
  const [areaPrioDraft, setAreaPrioDraft] = useState<Priority>(priorities[0]?.id ?? 1);

  const [editingPrioId, setEditingPrioId] = useState<Priority | null>(null);
  const [prioLabelDraft, setPrioLabelDraft] = useState("");

  const [newAreaLabel, setNewAreaLabel] = useState("");
  const [newAreaPrio, setNewAreaPrio] = useState<Priority>(priorities[0]?.id ?? 1);
  const [newPrioLabel, setNewPrioLabel] = useState("");

  function areaUsage(id: string): number {
    return cards.filter((c) => c.area === id).length;
  }

  function prioUsage(id: Priority): number {
    return cards.filter((c) => c.prio === id).length;
  }

  function startEditArea(area: AreaCategory) {
    setEditingAreaId(area.id);
    setAreaLabelDraft(area.label);
    setAreaPrioDraft(area.defaultPrio);
  }

  function saveArea() {
    if (!editingAreaId) return;
    const trimmed = areaLabelDraft.trim();
    if (!trimmed) return;
    onUpdateArea(editingAreaId, { label: trimmed, defaultPrio: areaPrioDraft });
    setEditingAreaId(null);
  }

  function handleDeleteArea(area: AreaCategory) {
    const count = areaUsage(area.id);
    if (count > 0) {
      showNotice(`"${area.label}" tem ${count} cartão(ões) nela. Mude a área deles antes de excluir.`);
      return;
    }
    onDeleteArea(area.id);
  }

  function startEditPrio(prio: PriorityLevel) {
    setEditingPrioId(prio.id);
    setPrioLabelDraft(prio.label);
  }

  function savePrio() {
    if (editingPrioId == null) return;
    const trimmed = prioLabelDraft.trim();
    if (!trimmed) return;
    onUpdatePriority(editingPrioId, trimmed);
    setEditingPrioId(null);
  }

  function handleDeletePrio(prio: PriorityLevel) {
    const count = prioUsage(prio.id);
    if (count > 0) {
      showNotice(`"${prio.label}" tem ${count} cartão(ões) nela. Mude a prioridade deles antes de excluir.`);
      return;
    }
    onDeletePriority(prio.id);
  }

  function handleAddArea(e: FormEvent) {
    e.preventDefault();
    const trimmed = newAreaLabel.trim();
    if (!trimmed) return;
    onAddArea(trimmed, newAreaPrio);
    setNewAreaLabel("");
  }

  function handleAddPrio(e: FormEvent) {
    e.preventDefault();
    const trimmed = newPrioLabel.trim();
    if (!trimmed) return;
    onAddPriority(trimmed);
    setNewPrioLabel("");
  }

  return (
    <Modal onClose={onClose} labelledBy="manage-taxonomy-title">
      <h2 id="manage-taxonomy-title">Categorias e prioridades</h2>

      <h3>Categorias</h3>
      <ul className="taxonomy-list">
        {areas.map((area) => (
          <li key={area.id}>
            {editingAreaId === area.id ? (
              <div className="taxonomy-edit-row">
                <input value={areaLabelDraft} onChange={(e) => setAreaLabelDraft(e.target.value)} />
                <select
                  value={areaPrioDraft}
                  onChange={(e) => setAreaPrioDraft(Number(e.target.value))}
                >
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setEditingAreaId(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn" onClick={saveArea}>
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <span>
                  {area.label} <small>({areaUsage(area.id)} cartões)</small>
                </span>
                <span className="taxonomy-row-actions">
                  <button type="button" onClick={() => startEditArea(area)}>
                    Editar
                  </button>
                  <button type="button" className="del" onClick={() => handleDeleteArea(area)}>
                    Excluir
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      <form className="taxonomy-add-row" onSubmit={handleAddArea}>
        <input
          placeholder="Nova categoria"
          maxLength={60}
          required
          value={newAreaLabel}
          onChange={(e) => setNewAreaLabel(e.target.value)}
        />
        <select value={newAreaPrio} onChange={(e) => setNewAreaPrio(Number(e.target.value))}>
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

      <h3>Prioridades</h3>
      <ul className="taxonomy-list">
        {priorities.map((prio) => (
          <li key={prio.id}>
            {editingPrioId === prio.id ? (
              <div className="taxonomy-edit-row">
                <input value={prioLabelDraft} onChange={(e) => setPrioLabelDraft(e.target.value)} />
                <button type="button" onClick={() => setEditingPrioId(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn" onClick={savePrio}>
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <span>
                  {prio.label} <small>({prioUsage(prio.id)} cartões)</small>
                </span>
                <span className="taxonomy-row-actions">
                  <button type="button" onClick={() => startEditPrio(prio)}>
                    Editar
                  </button>
                  <button type="button" className="del" onClick={() => handleDeletePrio(prio)}>
                    Excluir
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      <form className="taxonomy-add-row" onSubmit={handleAddPrio}>
        <input
          placeholder="Nova prioridade"
          maxLength={60}
          required
          value={newPrioLabel}
          onChange={(e) => setNewPrioLabel(e.target.value)}
        />
        <button className="btn" type="submit">
          Adicionar
        </button>
      </form>

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}
