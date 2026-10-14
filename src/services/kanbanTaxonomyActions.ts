import type { TaxonomyAction } from "@app-types/kanban.types";
import { KANBAN_TAXONOMY_CHANGED_EVENT } from "@constants/events";
import { SERVER_URL } from "@constants/server";

export interface ActionOutcome {
  ok: boolean;
  error?: string;
}

// Categorias e prioridades moram num arquivo estático versionado
// (src/constants/areasData.json e prioritiesData.json), não no localStorage —
// só o servidor tem acesso ao disco pra reescrevê-los.
export async function postTaxonomyAction(action: TaxonomyAction): Promise<ActionOutcome> {
  try {
    const res = await fetch(`${SERVER_URL}/api/kanban/taxonomy/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data: ActionOutcome = await res.json();
    if (data.ok) window.dispatchEvent(new Event(KANBAN_TAXONOMY_CHANGED_EVENT));
    return data;
  } catch {
    return { ok: false, error: "Não consegui falar com o servidor local pra editar categorias/prioridades." };
  }
}
