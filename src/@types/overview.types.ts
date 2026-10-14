import type { Card } from "./kanban.types";
import type { WeekChecks } from "./rotina.types";

export type DoneCard = Pick<Card, "id" | "title" | "area">;

export interface WeekStats {
  done: number;
  total: number;
  tasks: number;
  doneCards: DoneCard[];
  cOk: number;
  cLog: number;
  ch: WeekChecks;
}

export interface MonthTotals {
  sumDone: number;
  sumTotal: number;
  sumTasks: number;
  sumOk: number;
  sumLog: number;
}

export interface HabitProgress {
  id: string;
  title: string;
  done: number;
  total: number;
  percent: number;
}

export interface WeekRow {
  index: number;
  mondayDate: Date;
  sundayDate: Date;
  isCurrent: boolean;
  isFuture: boolean;
  stats: WeekStats;
  percent: number;
}

export interface OverviewTile {
  label: string;
  value: string;
  sub: string;
}

export interface OverviewData {
  label: string;
  tiles: OverviewTile[];
  weekRows: WeekRow[];
  habits: HabitProgress[];
}
