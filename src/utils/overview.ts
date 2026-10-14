import type { Card } from "@app-types/kanban.types";
import type { Habit, WeekChecks } from "@app-types/rotina.types";
import type { CigarrosPlan } from "@app-types/cigarros.types";
import type { HabitProgress, OverviewData, OverviewTile, WeekStats } from "@app-types/overview.types";
import { MONTHS } from "@constants/rotina";
import { PLAN_DAYS } from "@constants/cigarros";
import { cigDateOf, dayNumber, limitFor } from "@utils/cigarros";
import { mondayOf, parseYmd, ymd } from "@utils/date";

function weekStats(real: Habit[], mon: Date, ch: WeekChecks, cards: Card[], cig: CigarrosPlan): WeekStats {
  const weekTotal = real.reduce((sum, h) => sum + h.d.length, 0);
  let done = 0;
  real.forEach((h) => h.d.forEach((i) => { if (ch[`${h.id}_${i}`]) done++; }));

  const start = mon.getTime() - 12 * 3600000;
  const end = start + 7 * 86400000;
  const doneCards = cards.filter((c) => c.col === "done" && c.movedAt >= start && c.movedAt < end);

  let cOk = 0;
  let cLog = 0;
  if (cig.start) {
    const today = dayNumber(cig.start);
    for (let n = 1; n <= PLAN_DAYS && n <= today; n++) {
      const t = cigDateOf(cig.start, n).getTime();
      if (t >= start && t < end && (n < today || cig.counts[n] != null)) {
        cLog++;
        if ((cig.counts[n] || 0) <= limitFor(n)) cOk++;
      }
    }
  }
  return {
    done,
    total: weekTotal,
    tasks: doneCards.length,
    doneCards: doneCards.map((c) => ({ id: c.id, title: c.title, area: c.area })),
    cOk,
    cLog,
    ch,
  };
}

/** Mês (em offset relativo a hoje) do primeiro cartão criado ou primeiro
 * check de rotina marcado — não dá pra navegar pra antes disso. */
export function earliestActivityMonthOffset(cards: Card[], allWeeks: Record<string, WeekChecks>): number {
  const timestamps: number[] = cards.map((c) => c.created);
  Object.entries(allWeeks).forEach(([key, checks]) => {
    if (Object.values(checks).some(Boolean)) timestamps.push(parseYmd(key).getTime());
  });
  if (timestamps.length === 0) return 0;

  const earliest = new Date(Math.min(...timestamps));
  const now = new Date();
  return (earliest.getFullYear() - now.getFullYear()) * 12 + (earliest.getMonth() - now.getMonth());
}

export function buildOverviewData(
  monthOffset: number,
  habits: Habit[],
  cards: Card[],
  allWeeks: Record<string, WeekChecks>,
  cig: CigarrosPlan,
): OverviewData {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const y = base.getFullYear();
  const m = base.getMonth();
  const label = `${MONTHS[m]} ${y}`;

  const mondays: Date[] = [];
  const cursor = new Date(y, m, 1, 12);
  const dow = (cursor.getDay() + 6) % 7;
  cursor.setDate(cursor.getDate() - dow);
  const lastDay = new Date(y, m + 1, 0, 12).getTime();
  while (cursor.getTime() <= lastDay) {
    mondays.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  const thisMonday = mondayOf(0).getTime();
  let sumDone = 0, sumTotal = 0, sumTasks = 0, sumOk = 0, sumLog = 0;
  const perHabit: Record<string, { done: number; total: number }> = {};
  habits.forEach((h) => { perHabit[h.id] = { done: 0, total: 0 }; });

  const weekRows = mondays.map((mon, index) => {
    const isFuture = mon.getTime() > thisMonday;
    const isCurrent = mon.getTime() === thisMonday;
    const ch = allWeeks[ymd(mon)] ?? {};
    const stats = weekStats(habits, mon, ch, cards, cig);
    if (!isFuture) {
      sumDone += stats.done;
      sumTotal += stats.total;
      sumTasks += stats.tasks;
      sumOk += stats.cOk;
      sumLog += stats.cLog;
      habits.forEach((h) => h.d.forEach((i) => {
        perHabit[h.id].total++;
        if (stats.ch[`${h.id}_${i}`]) perHabit[h.id].done++;
      }));
    }
    const sunday = new Date(mon);
    sunday.setDate(mon.getDate() + 6);
    const percent = isFuture ? 0 : Math.round((stats.done / stats.total) * 100);
    return {
      index: index + 1,
      mondayDate: mon,
      sundayDate: sunday,
      isCurrent,
      isFuture,
      stats,
      percent,
    };
  });

  const tiles: OverviewTile[] = [
    {
      label: "Rotina no mês",
      value: sumTotal ? `${Math.round((sumDone / sumTotal) * 100)}%` : "—",
      sub: `${sumDone} de ${sumTotal} hábitos marcados`,
    },
    {
      label: "Tarefas concluídas",
      value: String(sumTasks),
      sub: "cartões que chegaram em Feito",
    },
    {
      label: "Cigarros",
      value: sumLog ? `${sumOk}/${sumLog}` : "—",
      sub: sumLog ? "dias dentro do limite" : "plano ainda sem dias neste mês",
    },
  ];

  const habitProgress: HabitProgress[] = habits.map((h) => {
    const p = perHabit[h.id];
    return {
      id: h.id,
      title: h.t,
      done: p.done,
      total: p.total,
      percent: p.total ? Math.round((p.done / p.total) * 100) : 0,
    };
  });

  return { label, tiles, weekRows, habits: habitProgress };
}
