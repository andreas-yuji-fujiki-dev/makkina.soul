import type { ClaudeConnectionStatus } from "@app-types/chat.types";
import { ClaudeIcon } from "./ClaudeIcon";

interface TopbarProps {
  status: ClaudeConnectionStatus;
  onClaudeClick: () => void;
}

export function Topbar({ status, onClaudeClick }: TopbarProps) {
  return (
    <div className="topbar">
      <button type="button" className="topbar-btn" onClick={onClaudeClick} aria-label="Conversar com o Claude">
        <ClaudeIcon />
        <span>Claude</span>
        <span className={`status-dot status-dot-${status}`} />
      </button>
    </div>
  );
}
