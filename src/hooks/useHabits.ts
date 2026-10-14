import { useCallback, useEffect, useState } from "react";
import type { DayIndex, HabitEntry } from "@app-types/rotina.types";
import { HABITS } from "@constants/rotina";
import { ROTINA_HABITS_CHANGED_EVENT } from "@constants/events";
import { SERVER_URL } from "@constants/server";
import { sortEntries } from "@utils/rotina";
import { postRotinaEntryAction } from "@services/rotinaEntryActions";

export function useHabits(showNotice: (text: string) => void) {
  const [entries, setEntries] = useState<HabitEntry[]>(() => sortEntries(HABITS));

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/rotina/habits`);
      if (!res.ok) throw new Error("status request failed");
      const data: { entries: HabitEntry[] } = await res.json();
      setEntries(sortEntries(data.entries));
    } catch {
      showNotice("Não consegui atualizar a rotina a partir do servidor.");
    }
  }, [showNotice]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    window.addEventListener(ROTINA_HABITS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(ROTINA_HABITS_CHANGED_EVENT, refresh);
  }, [refresh]);

  const updateHabit = useCallback(
    async (id: string, edits: { title: string; note: string; days: DayIndex[] }) => {
      const r = await postRotinaEntryAction({ type: "update_habit", id, ...edits });
      if (!r.ok) showNotice(r.error ?? "Não consegui editar o hábito.");
    },
    [showNotice],
  );

  const updateCategory = useCallback(
    async (id: string, title: string) => {
      const r = await postRotinaEntryAction({ type: "update_category", id, title });
      if (!r.ok) showNotice(r.error ?? "Não consegui renomear a categoria.");
    },
    [showNotice],
  );

  const addHabit = useCallback(
    async (input: { title: string; note: string; days: DayIndex[] }, afterId?: string) => {
      const r = await postRotinaEntryAction({ type: "add_habit", ...input, afterId });
      if (!r.ok) showNotice(r.error ?? "Não consegui criar o hábito.");
    },
    [showNotice],
  );

  const addCategory = useCallback(
    async (title: string, afterId?: string) => {
      const r = await postRotinaEntryAction({ type: "add_category", title, afterId });
      if (!r.ok) showNotice(r.error ?? "Não consegui criar a categoria.");
    },
    [showNotice],
  );

  const reorderEntry = useCallback(
    async (id: string, beforeId?: string, afterId?: string) => {
      const r = await postRotinaEntryAction({ type: "reorder_entry", id, beforeId, afterId });
      if (!r.ok) showNotice(r.error ?? "Não consegui reordenar.");
    },
    [showNotice],
  );

  return { entries, updateHabit, updateCategory, addHabit, addCategory, reorderEntry };
}
