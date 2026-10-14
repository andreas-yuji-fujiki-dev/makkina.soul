import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, ClaudeConnectionStatus, ClaudeStatusResponse } from "@app-types/chat.types";
import type { ClaudeAction } from "@app-types/claudeActions.types";
import { SERVER_URL } from "@constants/server";
import { buildClaudeContext } from "@services/claudeContext";
import { executeClaudeActions } from "@services/claudeActionExecutor";
import { describeActionResult } from "@utils/claudeActions";

export function useClaudeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ClaudeConnectionStatus>("checking");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const refreshStatus = useCallback(async () => {
    setStatus("checking");
    try {
      const res = await fetch(`${SERVER_URL}/api/status`);
      if (!res.ok) throw new Error("status request failed");
      const data: ClaudeStatusResponse = await res.json();
      if (!data.loggedIn) setStatus("disconnected");
      else if (data.expired) setStatus("expired");
      else setStatus("connected");
    } catch {
      setStatus("unreachable");
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const open = useCallback(() => {
    setIsOpen(true);
    refreshStatus();
  }, [refreshStatus]);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) refreshStatus();
      return !prev;
    });
  }, [refreshStatus]);

  const pushMessage = useCallback((role: ChatMessage["role"], content: string) => {
    const message: ChatMessage = { id: crypto.randomUUID(), role, content, createdAt: Date.now() };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sending) return;

      pushMessage("user", trimmed);
      setSending(true);
      try {
        const context = await buildClaudeContext();
        const res = await fetch(`${SERVER_URL}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: trimmed, sessionId, context }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushMessage("assistant", `Erro: ${data.error ?? "falha desconhecida"}`);
          return;
        }
        if (data.sessionId) setSessionId(data.sessionId);

        const actions: ClaudeAction[] = Array.isArray(data.actions) ? data.actions : [];
        let replyText = typeof data.reply === "string" ? data.reply : "";
        if (actions.length > 0) {
          const results = await executeClaudeActions(actions);
          const summary = results.map(describeActionResult).join("\n");
          replyText = replyText ? `${replyText}\n\n${summary}` : summary;
        }
        pushMessage("assistant", replyText || "(resposta vazia)");
      } catch {
        pushMessage(
          "assistant",
          "Não consegui falar com o servidor local. Ele está rodando? (`npm run dev:server`)",
        );
      } finally {
        setSending(false);
      }
    },
    [sessionId, pushMessage, sending],
  );

  return { isOpen, open, close, toggle, messages, sendMessage, status, sending, refreshStatus };
}
