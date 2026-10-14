import type { CigarrosPlan } from "@app-types/cigarros.types";
import { db } from "@services/db";
import { PLAN_DAYS } from "@constants/cigarros";
import { dayNumber } from "@utils/cigarros";
import type { ActionOutcome } from "./kanbanActions";

const EMPTY_PLAN: CigarrosPlan = { start: null, counts: {} };

async function getCig(): Promise<CigarrosPlan> {
  const snap = await db.doc<CigarrosPlan>("cigarros/plano").get();
  return snap.exists ? (snap.data() as CigarrosPlan) : EMPTY_PLAN;
}

export async function startCigarrosPlanAction(date: string): Promise<ActionOutcome> {
  await db.doc<CigarrosPlan>("cigarros/plano").set({ start: date, counts: {} });
  return { ok: true };
}

export async function bumpCigarrosAction(delta: number): Promise<ActionOutcome> {
  const cig = await getCig();
  const n = dayNumber(cig.start);
  if (n < 1 || n > PLAN_DAYS) return { ok: false, error: "Não há plano de cigarros ativo hoje." };
  const current = cig.counts[n] || 0;
  const next: CigarrosPlan = { ...cig, counts: { ...cig.counts, [n]: Math.max(current + delta, 0) } };
  await db.doc<CigarrosPlan>("cigarros/plano").set(next);
  return { ok: true };
}

export async function resetCigarrosPlanAction(): Promise<ActionOutcome> {
  await db.doc("cigarros/plano").delete();
  return { ok: true };
}
