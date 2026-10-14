import { useState } from "react";
import type { CigarrosPlan } from "@app-types/cigarros.types";
import { PLAN_DAYS } from "@constants/cigarros";
import { buildDayCells, dayNumber, limitFor, scoreDayCells } from "@utils/cigarros";
import { fmt, parseYmd } from "@utils/date";
import { CigDaysGrid } from "./CigDaysGrid";

interface CigRunPanelProps {
  cig: CigarrosPlan;
  onBump: (delta: number) => void;
  onReset: () => void;
}

export function CigRunPanel({ cig, onBump, onReset }: CigRunPanelProps) {
  const [resetArmed, setResetArmed] = useState(false);
  const n = dayNumber(cig.start);
  const cells = buildDayCells(cig, n);
  const { ok, logged } = scoreDayCells(cells);

  function handleResetClick() {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    setResetArmed(false);
    onReset();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="panel">
        <div className="cig-today-head">
          <span className="eyebrow">
            {n < 1
              ? `Começa em ${fmt(parseYmd(cig.start as string))}`
              : n > PLAN_DAYS
                ? "Plano concluído"
                : `Dia ${n} de ${PLAN_DAYS}`}
          </span>
          <span className="cig-limit">
            {n < 1 ? "Dia 1: até 30" : n > PLAN_DAYS ? "Meta agora: zero" : `Limite de hoje: ${limitFor(n)}`}
          </span>
        </div>
        {n >= 1 && n <= PLAN_DAYS && (
          <div className={`cig-counter${(cig.counts[n] || 0) > limitFor(n) ? " over" : ""}`}>
            <button type="button" aria-label="Tirar um cigarro" onClick={() => onBump(-1)}>
              −
            </button>
            <div>
              <strong>{cig.counts[n] || 0}</strong>
              <span>de {limitFor(n)} hoje</span>
            </div>
            <button type="button" aria-label="Registrar um cigarro" onClick={() => onBump(1)}>
              +
            </button>
          </div>
        )}
        <p className="cig-msg">
          {n < 1
            ? "O contador aparece no primeiro dia."
            : n > PLAN_DAYS
              ? "Você chegou ao fim dos 30 dias. Se precisar de apoio para manter o zero, o programa de tabagismo da UBS é gratuito."
              : (cig.counts[n] || 0) > limitFor(n)
                ? "Passou do limite hoje. Tudo bem: amanhã o plano segue igual, sem compensar."
                : `${limitFor(n) - (cig.counts[n] || 0)} restantes hoje. Toque + a cada cigarro.`}
        </p>
      </div>
      <CigDaysGrid cells={cells} />
      <div className="cig-foot">
        <span className="score">{logged ? `${ok} de ${logged} dias dentro do limite` : "Primeiro dia do plano"}</span>
        <button type="button" className={resetArmed ? "reset confirm" : "reset"} onClick={handleResetClick}>
          {resetArmed ? "Confirmar: apagar o plano" : "Recomeçar plano"}
        </button>
      </div>
    </div>
  );
}
