import type { WeekChecks } from "@app-types/rotina.types";
import { db } from "@services/db";
import { mondayOf, ymd } from "@utils/date";
import type { ActionOutcome } from "./kanbanActions";

interface WeekDoc {
  checks: WeekChecks;
}

// Sempre opera na semana atual (offset 0) — é o escopo natural de um pedido
// como "marca que eu fiz academia hoje" vindo do chat.
export async function toggleHabitAction(habitId: string, day: number, value: boolean): Promise<ActionOutcome> {
  const path = `weeks/${ymd(mondayOf(0))}`;
  const ref = db.doc<WeekDoc>(path);
  const snap = await ref.get();
  const current = snap.exists ? (snap.data()?.checks ?? {}) : {};
  const key = `${habitId}_${day}`;
  await ref.set({ checks: { ...current, [key]: value } });
  return { ok: true };
}
