import type { ClaudeAction, ClaudeActionResult } from "@app-types/claudeActions.types";
import {
  addCardAction,
  deleteCardAction,
  moveCardAction,
  reorderCardAction,
  updateCardAction,
} from "./kanbanActions";
import { toggleHabitAction } from "./rotinaActions";
import { postRotinaEntryAction } from "./rotinaEntryActions";
import { bumpCigarrosAction, resetCigarrosPlanAction, startCigarrosPlanAction } from "./cigarrosActions";

export async function executeClaudeAction(action: ClaudeAction): Promise<ClaudeActionResult> {
  try {
    switch (action.type) {
      case "add_card": {
        const r = await addCardAction({ title: action.title, area: action.area, prio: action.prio });
        return { action, ...r };
      }
      case "update_card": {
        const { id, ...edits } = action;
        const r = await updateCardAction(id, edits);
        return { action, ...r };
      }
      case "move_card": {
        const r = await moveCardAction(action.id, action.col);
        return { action, ...r };
      }
      case "reorder_card": {
        const r = await reorderCardAction(action.id, action.col, action.beforeId, action.afterId);
        return { action, ...r };
      }
      case "delete_card": {
        const r = await deleteCardAction(action.id);
        return { action, ...r };
      }
      case "toggle_habit": {
        const r = await toggleHabitAction(action.habitId, action.day, action.value);
        return { action, ...r };
      }
      case "add_habit":
      case "update_habit":
      case "delete_habit":
      case "add_category":
      case "update_category":
      case "reorder_entry": {
        const r = await postRotinaEntryAction(action);
        return { action, ...r };
      }
      case "start_cigarros_plan": {
        const r = await startCigarrosPlanAction(action.date);
        return { action, ...r };
      }
      case "bump_cigarros": {
        const r = await bumpCigarrosAction(action.delta);
        return { action, ...r };
      }
      case "reset_cigarros_plan": {
        const r = await resetCigarrosPlanAction();
        return { action, ...r };
      }
    }
  } catch (e) {
    return { action, ok: false, error: e instanceof Error ? e.message : "Falha ao executar ação." };
  }
}

export async function executeClaudeActions(actions: ClaudeAction[]): Promise<ClaudeActionResult[]> {
  const results: ClaudeActionResult[] = [];
  for (const action of actions) {
    results.push(await executeClaudeAction(action));
  }
  return results;
}
