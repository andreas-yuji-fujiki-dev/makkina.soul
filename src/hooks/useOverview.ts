import { useCallback, useMemo, useState } from "react";
import type { Card } from "@app-types/kanban.types";
import type { Habit, WeekChecks } from "@app-types/rotina.types";
import type { CigarrosPlan } from "@app-types/cigarros.types";
import { buildOverviewData, earliestActivityMonthOffset } from "@utils/overview";

export function useOverview(
  habits: Habit[],
  cards: Card[],
  allWeeks: Record<string, WeekChecks>,
  cig: CigarrosPlan,
) {
  const [monthOffset, setMonthOffset] = useState(0);

  const minMonthOffset = useMemo(
    () => earliestActivityMonthOffset(cards, allWeeks),
    [cards, allWeeks],
  );

  const data = useMemo(
    () => buildOverviewData(monthOffset, habits, cards, allWeeks, cig),
    [monthOffset, habits, cards, allWeeks, cig],
  );

  const prevMonth = useCallback(
    () => setMonthOffset((o) => Math.max(o - 1, minMonthOffset)),
    [minMonthOffset],
  );
  const nextMonth = useCallback(() => setMonthOffset((o) => Math.min(o + 1, 0)), []);

  return {
    ...data,
    prevMonth,
    nextMonth,
    canGoPrev: monthOffset > minMonthOffset,
    canGoNext: monthOffset < 0,
  };
}
