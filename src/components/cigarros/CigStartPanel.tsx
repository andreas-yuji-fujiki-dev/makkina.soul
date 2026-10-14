import { useState } from "react";
import { ymd } from "@utils/date";

interface CigStartPanelProps {
  onStart: (date: string) => void;
}

export function CigStartPanel({ onStart }: CigStartPanelProps) {
  const [date, setDate] = useState(() => ymd(new Date()));

  return (
    <div className="panel">
      <h2>Desmame em 30 dias</h2>
      <p className="lede">Dia 1: até 30 cigarros. A cada dia, um a menos. Dia 30: só 1. Depois disso, zero.</p>
      <div className="cig-row">
        <label htmlFor="cig-date">Começar em</label>
        <input id="cig-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn" type="button" onClick={() => onStart(date)}>
          Começar o plano
        </button>
      </div>
    </div>
  );
}
