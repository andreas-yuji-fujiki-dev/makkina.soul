import type { Habit, HabitEntry, HabitGroup, WeekChecks } from "@app-types/rotina.types";

export function isHabitGroup(entry: HabitEntry): entry is HabitGroup {
  return "g" in entry;
}

export function sortEntries(entries: HabitEntry[]): HabitEntry[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

export function realHabits(entries: HabitEntry[]): Habit[] {
  return entries.filter((entry): entry is Habit => !isHabitGroup(entry));
}

export function todayIndex(weekOffset: number): number {
  return weekOffset === 0 ? (new Date().getDay() + 6) % 7 : -1;
}

export function countChecks(habits: Habit[], checks: WeekChecks): { done: number; total: number } {
  let done = 0;
  let total = 0;
  habits.forEach((h) => h.d.forEach((i) => {
    total++;
    if (checks[`${h.id}_${i}`]) done++;
  }));
  return { done, total };
}
