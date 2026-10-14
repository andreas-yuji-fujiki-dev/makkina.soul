import { useCallback, useEffect, useState } from "react";
import type { KanbanColumnDef } from "@app-types/kanban.types";
import { COLUMNS } from "@constants/columns";
import { KANBAN_COLUMNS_CHANGED_EVENT } from "@constants/events";
import { SERVER_URL } from "@constants/server";
import { postColumnAction } from "@services/kanbanColumnActions";

function sortByOrder(list: KanbanColumnDef[]): KanbanColumnDef[] {
  return [...list].sort((a, b) => a.order - b.order);
}

export function useKanbanColumns(showNotice: (text: string) => void) {
  const [columns, setColumns] = useState<KanbanColumnDef[]>(COLUMNS);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/kanban/columns`);
      if (!res.ok) throw new Error("status request failed");
      const data: { columns: KanbanColumnDef[] } = await res.json();
      setColumns(sortByOrder(data.columns));
    } catch {
      showNotice("Não consegui atualizar as colunas a partir do servidor.");
    }
  }, [showNotice]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    window.addEventListener(KANBAN_COLUMNS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(KANBAN_COLUMNS_CHANGED_EVENT, refresh);
  }, [refresh]);

  const addColumn = useCallback(
    async (label: string) => {
      const r = await postColumnAction({ type: "add_column", label });
      if (!r.ok) showNotice(r.error ?? "Não consegui criar a coluna.");
    },
    [showNotice],
  );

  const updateColumn = useCallback(
    async (id: string, label: string) => {
      const r = await postColumnAction({ type: "update_column", id, label });
      if (!r.ok) showNotice(r.error ?? "Não consegui renomear a coluna.");
    },
    [showNotice],
  );

  const reorderColumn = useCallback(
    async (id: string, beforeId?: string, afterId?: string) => {
      const r = await postColumnAction({ type: "reorder_column", id, beforeId, afterId });
      if (!r.ok) showNotice(r.error ?? "Não consegui reordenar a coluna.");
    },
    [showNotice],
  );

  return { columns, addColumn, updateColumn, reorderColumn };
}
