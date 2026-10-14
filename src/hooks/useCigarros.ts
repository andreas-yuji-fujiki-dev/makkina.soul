import { useCallback, useEffect, useRef, useState } from "react";
import type { CigarrosPlan } from "@app-types/cigarros.types";
import { db } from "@services/db";
import { PLAN_DAYS } from "@constants/cigarros";
import { dayNumber } from "@utils/cigarros";
import { describeWriteError } from "@utils/errors";

const EMPTY_PLAN: CigarrosPlan = { start: null, counts: {} };
const SAVE_DEBOUNCE_MS = 700;

export function useCigarros(showNotice: (text: string) => void) {
  const [cig, setCig] = useState<CigarrosPlan>(EMPTY_PLAN);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = db.doc<CigarrosPlan>("cigarros/plano").onSnapshot(
      (snap) => {
        const data = snap.exists ? snap.data() : undefined;
        setCig(data?.start ? { start: data.start, counts: { ...data.counts } } : EMPTY_PLAN);
      },
      () => showNotice("O contador de cigarros parou de sincronizar. Recarregue a página."),
    );
    return unsubscribe;
  }, [showNotice]);

  const persist = useCallback(
    (next: CigarrosPlan) => {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        db.doc<CigarrosPlan>("cigarros/plano").set(next).catch((e) => showNotice(describeWriteError(e)));
      }, SAVE_DEBOUNCE_MS);
    },
    [showNotice],
  );

  const start = useCallback(
    (dateStr: string) => {
      const next: CigarrosPlan = { start: dateStr, counts: {} };
      setCig(next);
      persist(next);
    },
    [persist],
  );

  const bump = useCallback(
    (delta: number) => {
      setCig((prev) => {
        const n = dayNumber(prev.start);
        if (n < 1 || n > PLAN_DAYS) return prev;
        const current = prev.counts[n] || 0;
        const next: CigarrosPlan = {
          ...prev,
          counts: { ...prev.counts, [n]: Math.max(current + delta, 0) },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    window.clearTimeout(saveTimer.current);
    setCig(EMPTY_PLAN);
    db.doc("cigarros/plano").delete().catch((e) => showNotice(describeWriteError(e)));
  }, [showNotice]);

  return { cig, start, bump, reset };
}
