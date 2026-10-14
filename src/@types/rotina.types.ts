export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface HabitGroup {
  id: string;
  g: string;
  order: number;
}

export interface Habit {
  id: string;
  t: string;
  s: string;
  d: DayIndex[];
  order: number;
}

export type HabitEntry = HabitGroup | Habit;

export type WeekChecks = Record<string, boolean>;
