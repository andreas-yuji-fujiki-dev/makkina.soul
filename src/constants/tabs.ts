import type { TabId } from "@app-types/layout.types";

export const TABS: TabId[] = ["kanban", "rotina", "cigarros", "overview"];

export const TAB_LABELS: Record<TabId, string> = {
  kanban: "Kanban",
  rotina: "Rotina",
  cigarros: "Cigarros",
  overview: "Overview",
};
