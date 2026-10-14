import { useCallback, useEffect, useState } from "react";
import type { AreaCategory, Priority, PriorityLevel } from "@app-types/kanban.types";
import { AREAS, PRIORITIES } from "@constants/areas";
import { KANBAN_TAXONOMY_CHANGED_EVENT } from "@constants/events";
import { SERVER_URL } from "@constants/server";
import { postTaxonomyAction } from "@services/kanbanTaxonomyActions";

function sortByOrder<T extends { order: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.order - b.order);
}

export function useKanbanTaxonomy(showNotice: (text: string) => void) {
  const [areas, setAreas] = useState<AreaCategory[]>(AREAS);
  const [priorities, setPriorities] = useState<PriorityLevel[]>(PRIORITIES);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/kanban/taxonomy`);
      if (!res.ok) throw new Error("status request failed");
      const data: { areas: AreaCategory[]; priorities: PriorityLevel[] } = await res.json();
      setAreas(sortByOrder(data.areas));
      setPriorities(sortByOrder(data.priorities));
    } catch {
      showNotice("Não consegui atualizar categorias/prioridades a partir do servidor.");
    }
  }, [showNotice]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    window.addEventListener(KANBAN_TAXONOMY_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(KANBAN_TAXONOMY_CHANGED_EVENT, refresh);
  }, [refresh]);

  const addArea = useCallback(
    async (label: string, defaultPrio: Priority) => {
      const r = await postTaxonomyAction({ type: "add_area", label, defaultPrio });
      if (!r.ok) showNotice(r.error ?? "Não consegui criar a categoria.");
    },
    [showNotice],
  );

  const updateArea = useCallback(
    async (id: string, edits: { label?: string; defaultPrio?: Priority }) => {
      const r = await postTaxonomyAction({ type: "update_area", id, ...edits });
      if (!r.ok) showNotice(r.error ?? "Não consegui editar a categoria.");
    },
    [showNotice],
  );

  const deleteArea = useCallback(
    async (id: string) => {
      const r = await postTaxonomyAction({ type: "delete_area", id });
      if (!r.ok) showNotice(r.error ?? "Não consegui excluir a categoria.");
    },
    [showNotice],
  );

  const addPriority = useCallback(
    async (label: string) => {
      const r = await postTaxonomyAction({ type: "add_priority", label });
      if (!r.ok) showNotice(r.error ?? "Não consegui criar a prioridade.");
    },
    [showNotice],
  );

  const updatePriority = useCallback(
    async (id: Priority, label: string) => {
      const r = await postTaxonomyAction({ type: "update_priority", id, label });
      if (!r.ok) showNotice(r.error ?? "Não consegui editar a prioridade.");
    },
    [showNotice],
  );

  const deletePriority = useCallback(
    async (id: Priority) => {
      const r = await postTaxonomyAction({ type: "delete_priority", id });
      if (!r.ok) showNotice(r.error ?? "Não consegui excluir a prioridade.");
    },
    [showNotice],
  );

  return { areas, priorities, addArea, updateArea, deleteArea, addPriority, updatePriority, deletePriority };
}
