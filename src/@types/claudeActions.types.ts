import type { Area, ColumnId, Priority } from "./kanban.types";

export type ClaudeAction =
  | { type: "add_card"; title: string; area: Area; prio: Priority }
  | { type: "update_card"; id: string; title?: string; note?: string; area?: Area; prio?: Priority }
  | { type: "move_card"; id: string; col: ColumnId }
  | { type: "reorder_card"; id: string; col: ColumnId; beforeId?: string; afterId?: string }
  | { type: "delete_card"; id: string }
  | { type: "toggle_habit"; habitId: string; day: number; value: boolean }
  | { type: "add_habit"; title: string; note?: string; days: number[]; afterId?: string }
  | { type: "update_habit"; id: string; title?: string; note?: string; days?: number[] }
  | { type: "delete_habit"; id: string }
  | { type: "add_category"; title: string; afterId?: string }
  | { type: "update_category"; id: string; title: string }
  | { type: "reorder_entry"; id: string; beforeId?: string; afterId?: string }
  | { type: "start_cigarros_plan"; date: string }
  | { type: "bump_cigarros"; delta: number }
  | { type: "reset_cigarros_plan" };

export type ClaudeActionType = ClaudeAction["type"];

export interface ClaudeActionResult {
  action: ClaudeAction;
  ok: boolean;
  error?: string;
}

export interface ClaudeChatReply {
  reply: string;
  actions: ClaudeAction[];
}
