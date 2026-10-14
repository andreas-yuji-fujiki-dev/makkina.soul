import type { ClaudeAction } from "@app-types/claudeActions.types";
import { ROTINA_HABITS_CHANGED_EVENT } from "@constants/events";
import { SERVER_URL } from "@constants/server";

export interface ActionOutcome {
  ok: boolean;
  error?: string;
}

// Hábitos e categorias da rotina moram num arquivo estático versionado
// (src/constants/rotinaData.json), não no localStorage — só o servidor tem
// acesso ao disco pra reescrevê-lo. Usado tanto pelas ações do chat do
// Claude quanto pela edição manual na aba Rotina.
export async function postRotinaEntryAction(action: ClaudeAction): Promise<ActionOutcome> {
  try {
    const res = await fetch(`${SERVER_URL}/api/rotina/habits/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data: ActionOutcome = await res.json();
    if (data.ok) window.dispatchEvent(new Event(ROTINA_HABITS_CHANGED_EVENT));
    return data;
  } catch {
    return { ok: false, error: "Não consegui falar com o servidor local pra editar a rotina." };
  }
}
