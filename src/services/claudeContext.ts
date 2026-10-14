import type { Card, CardSeed } from "@app-types/kanban.types";
import type { HabitEntry, WeekChecks } from "@app-types/rotina.types";
import type { CigarrosPlan } from "@app-types/cigarros.types";
import { db } from "@services/db";
import { SERVER_URL } from "@constants/server";
import { mondayOf, ymd } from "@utils/date";
import { buildOverviewData } from "@utils/overview";
import { isHabitGroup, realHabits, sortEntries } from "@utils/rotina";

interface WeekDoc {
  checks: WeekChecks;
}

export interface ClaudeAppContext {
  today: string;
  kanban: {
    cards: Array<Pick<Card, "id" | "title" | "note" | "area" | "prio" | "col">>;
  };
  rotina: {
    entries: Array<
      | { kind: "category"; id: string; title: string }
      | { kind: "habit"; id: string; title: string; note: string; days: number[] }
    >;
    currentWeekChecks: WeekChecks;
  };
  cigarros: CigarrosPlan;
  overviewSummary: {
    tiles: { label: string; value: string; sub: string }[];
    habits: { id: string; title: string; done: number; total: number; percent: number }[];
  };
}

export async function buildClaudeContext(): Promise<ClaudeAppContext> {
  const cardsSnap = await db.collection<CardSeed>("cards").get();
  const cards: Card[] = cardsSnap.docs.map((d) => ({ ...(d.data() as CardSeed), id: d.id }));

  const weeksSnap = await db.collection<WeekDoc>("weeks").get();
  const allWeeks: Record<string, WeekChecks> = {};
  weeksSnap.docs.forEach((d) => {
    const data = d.data();
    allWeeks[d.id] = data?.checks ?? {};
  });

  const cigSnap = await db.doc<CigarrosPlan>("cigarros/plano").get();
  const cig: CigarrosPlan = cigSnap.exists ? (cigSnap.data() as CigarrosPlan) : { start: null, counts: {} };

  // Hábitos/categorias moram num arquivo estático lido pelo servidor, não no
  // localStorage — buscamos de lá pra sempre mandar pro Claude o estado real
  // em disco, inclusive edições feitas um instante atrás nesta mesma sessão.
  const habitsRes = await fetch(`${SERVER_URL}/api/rotina/habits`);
  const habitsData: { entries: HabitEntry[] } = habitsRes.ok ? await habitsRes.json() : { entries: [] };
  const entries = sortEntries(habitsData.entries);

  const currentWeekKey = ymd(mondayOf(0));
  const overview = buildOverviewData(0, realHabits(entries), cards, allWeeks, cig);

  return {
    today: ymd(new Date()),
    kanban: {
      cards: cards.map((c) => ({
        id: c.id,
        title: c.title,
        note: c.note,
        area: c.area,
        prio: c.prio,
        col: c.col,
      })),
    },
    rotina: {
      entries: entries.map((e) =>
        isHabitGroup(e)
          ? { kind: "category" as const, id: e.id, title: e.g }
          : { kind: "habit" as const, id: e.id, title: e.t, note: e.s, days: e.d },
      ),
      currentWeekChecks: allWeeks[currentWeekKey] ?? {},
    },
    cigarros: cig,
    overviewSummary: {
      tiles: overview.tiles,
      habits: overview.habits,
    },
  };
}
