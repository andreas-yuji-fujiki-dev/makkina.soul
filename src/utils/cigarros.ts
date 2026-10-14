import type { CigarrosDayCell, CigarrosPlan } from "@app-types/cigarros.types";
import { PLAN_DAYS } from "@constants/cigarros";
import { parseYmd } from "@utils/date";

/** Limite de cigarros permitido no dia `n` do plano de desmame. */
export function limitFor(n: number): number {
  return Math.max(PLAN_DAYS + 1 - n, 1);
}

/** Número do dia do plano (1-indexado) para a data de início `start`, hoje. */
export function dayNumber(start: string | null): number {
  if (!start) return 0;
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((now.getTime() - parseYmd(start).getTime()) / 86400000) + 1;
}

/** Data correspondente ao dia `n` do plano iniciado em `start`. */
export function cigDateOf(start: string, n: number): Date {
  const d = parseYmd(start);
  d.setDate(d.getDate() + n - 1);
  return d;
}

export function buildDayCells(plan: CigarrosPlan, today: number): CigarrosDayCell[] {
  const cells: CigarrosDayCell[] = [];
  for (let day = 1; day <= PLAN_DAYS; day++) {
    const limit = limitFor(day);
    const isFuture = day > today;
    const isToday = day === today;
    const explicit = plan.counts[day] != null;
    const counted = !isFuture && (explicit || day < today);
    cells.push({
      day,
      limit,
      value: counted ? plan.counts[day] || 0 : limit,
      hasValue: counted,
      isToday,
      isFuture,
    });
  }
  return cells;
}

export interface CigarrosScore {
  ok: number;
  logged: number;
}

export function scoreDayCells(cells: CigarrosDayCell[]): CigarrosScore {
  let ok = 0;
  let logged = 0;
  cells.forEach((cell) => {
    if (cell.isFuture || !cell.hasValue) return;
    logged++;
    if (cell.value <= cell.limit) ok++;
  });
  return { ok, logged };
}
