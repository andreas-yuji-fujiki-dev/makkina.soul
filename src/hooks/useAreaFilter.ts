import { useCallback, useState } from "react";
import { DEFAULT_AREA_FILTER } from "@constants/kanban";

const STORAGE_KEY = "mapa-area";

function initialFilter(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_AREA_FILTER;
  } catch {
    return DEFAULT_AREA_FILTER;
  }
}

export function useAreaFilter() {
  const [areaFilter, setAreaFilterState] = useState<string>(initialFilter);

  const setAreaFilter = useCallback((area: string) => {
    setAreaFilterState(area);
    try {
      localStorage.setItem(STORAGE_KEY, area);
    } catch {
      // Sem persistência disponível: o filtro ainda muda nesta sessão.
    }
  }, []);

  return { areaFilter, setAreaFilter };
}
