import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { ChatMessage, ClaudeConnectionStatus } from "@app-types/chat.types";
import { ClaudeIcon } from "./ClaudeIcon";

interface ClaudePanelProps {
  open: boolean;
  messages: ChatMessage[];
  status: ClaudeConnectionStatus;
  sending: boolean;
  onClose: () => void;
  onSend: (content: string) => void;
}

const STATUS_LABEL: Record<ClaudeConnectionStatus, string> = {
  checking: "Verificando sessão…",
  connected: "Conectado via Claude Code",
  expired: "Sessão expirada — rode `claude login`",
  disconnected: "Nenhuma sessão encontrada — rode `claude login`",
  unreachable: "Servidor local não encontrado — rode `npm run dev:server`",
};

export function ClaudePanel({ open, messages, status, sending, onClose, onSend }: ClaudePanelProps) {
  const [draft, setDraft] = useState("");
  const canSend = status === "connected" && !sending;

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !canSend) return;
    onSend(draft);
    setDraft("");
  }

  function handleTextareaKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!draft.trim() || !canSend) return;
      onSend(draft);
      setDraft("");
    }
  }

  return (
    <>
      <div className="claude-backdrop" onClick={onClose} />
      <aside className="claude-panel" role="dialog" aria-label="Conversa com o Claude">
        <div className="claude-panel-head">
          <span className="claude-panel-title">
            <ClaudeIcon />
            Claude
          </span>
          <button type="button" className="claude-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className={`claude-status claude-status-${status}`}>{STATUS_LABEL[status]}</div>
        <div className="claude-messages">
          {messages.length === 0 ? (
            <p className="claude-empty">Nenhuma mensagem ainda. Mande algo pra começar.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`claude-msg claude-msg-${m.role}`}>
                {m.content}
              </div>
            ))
          )}
          {sending && <div className="claude-msg claude-msg-assistant claude-msg-pending">…</div>}
        </div>
        <form className="claude-input-row" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder={canSend ? "Mensagem para o Claude..." : STATUS_LABEL[status]}
            rows={2}
            disabled={!canSend}
          />
          <button className="btn" type="submit" disabled={!canSend || !draft.trim()}>
            Enviar
          </button>
        </form>
      </aside>
    </>
  );
}
