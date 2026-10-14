export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export type ClaudeConnectionStatus = "checking" | "connected" | "expired" | "disconnected" | "unreachable";

export interface ClaudeStatusResponse {
  loggedIn: boolean;
  expired: boolean;
  subscriptionType: string | null;
}
