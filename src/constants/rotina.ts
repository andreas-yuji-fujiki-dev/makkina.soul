import type { HabitEntry } from "@app-types/rotina.types";
import rotinaData from "./rotinaData.json";

export const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Fonte estática versionada no repo (src/constants/rotinaData.json). O
// servidor a reescreve de verdade quando o Claude do app edita a rotina —
// ver server/rotinaEntries.ts.
export const HABITS = rotinaData as HabitEntry[];
