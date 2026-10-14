import { useCallback, useEffect, useState } from "react";
import type { WeekChecks } from "@app-types/rotina.types";
import { db } from "@services/db";
import { mondayOf, ymd } from "@utils/date";
import { describeWriteError } from "@utils/errors";

interface WeekDoc {
  checks: WeekChecks;
}

export function useWeek(showNotice: (text: string) => void) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [checks, setChecks] = useState<WeekChecks>({});

  useEffect(() => {
    const path = `weeks/${ymd(mondayOf(weekOffset))}`;
    const unsubscribe = db.doc<WeekDoc>(path).onSnapshot(
      (snap) => {
        const data = snap.exists ? snap.data() : undefined;
        setChecks(data?.checks ? { ...data.checks } : {});
      },
      () => showNotice("A rotina parou de sincronizar. Recarregue a página."),
    );
    return unsubscribe;
  }, [weekOffset, showNotice]);

  const toggle = useCallback(
    (key: string, value: boolean) => {
      setChecks((prev) => {
        const next = { ...prev, [key]: value };
        db.doc<WeekDoc>(`weeks/${ymd(mondayOf(weekOffset))}`)
          .set({ checks: next })
          .catch((e) => showNotice(describeWriteError(e)));
        return next;
      });
    },
    [weekOffset, showNotice],
  );

  const prevWeek = useCallback(() => setWeekOffset((o) => o - 1), []);
  const nextWeek = useCallback(() => setWeekOffset((o) => o + 1), []);

  return { weekOffset, checks, toggle, prevWeek, nextWeek };
}
