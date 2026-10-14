import { useCallback, useState } from "react";
import type { TabId } from "@app-types/layout.types";
import { TABS } from "@constants/tabs";

const STORAGE_KEY = "mapa-tab";

function initialTab(): TabId {
  const fromHash = location.hash.slice(1) as TabId;
  if (TABS.includes(fromHash)) return fromHash;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as TabId | null;
    if (stored && TABS.includes(stored)) return stored;
  } catch {
    // localStorage indisponível: segue com o padrão.
  }
  return "kanban";
}

export function useTabs() {
  const [tab, setTabState] = useState<TabId>(initialTab);

  const setTab = useCallback((next: TabId) => {
    setTabState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sem persistência disponível: a aba ainda muda nesta sessão.
    }
  }, []);

  return { tab, setTab };
}
