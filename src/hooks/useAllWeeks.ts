import { useEffect, useState } from "react";
import type { WeekChecks } from "@app-types/rotina.types";
import { db } from "@services/db";

interface WeekDoc {
  checks: WeekChecks;
}

export function useAllWeeks() {
  const [allWeeks, setAllWeeks] = useState<Record<string, WeekChecks>>({});

  useEffect(() => {
    const unsubscribe = db.collection<WeekDoc>("weeks").onSnapshot((snap) => {
      const next: Record<string, WeekChecks> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        next[d.id] = data?.checks ?? {};
      });
      setAllWeeks(next);
    });
    return unsubscribe;
  }, []);

  return allWeeks;
}
