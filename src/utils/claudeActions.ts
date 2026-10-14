import type { ClaudeActionResult, ClaudeActionType } from "@app-types/claudeActions.types";

const ACTION_LABEL: Record<ClaudeActionType, string> = {
  add_card: "Criar cartão",
  update_card: "Editar cartão",
  move_card: "Mover cartão",
  reorder_card: "Reordenar cartão",
  delete_card: "Excluir cartão",
  toggle_habit: "Marcar hábito",
  add_habit: "Criar hábito",
  update_habit: "Editar hábito",
  delete_habit: "Excluir hábito",
  add_category: "Criar categoria",
  update_category: "Renomear categoria",
  reorder_entry: "Reordenar item da rotina",
  start_cigarros_plan: "Iniciar plano de cigarros",
  bump_cigarros: "Atualizar contador de cigarros",
  reset_cigarros_plan: "Reiniciar plano de cigarros",
};

export function describeActionResult(result: ClaudeActionResult): string {
  const label = ACTION_LABEL[result.action.type];
  return result.ok ? `✓ ${label}` : `✗ ${label}: ${result.error ?? "falhou"}`;
}
