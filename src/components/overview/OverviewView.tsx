import { useState } from "react";
import type { WeekRow } from "@app-types/overview.types";
import { useCards } from "@hooks/useCards";
import { useAllWeeks } from "@hooks/useAllWeeks";
import { useCigarros } from "@hooks/useCigarros";
import { useHabits } from "@hooks/useHabits";
import { useKanbanTaxonomy } from "@hooks/useKanbanTaxonomy";
import { useOverview } from "@hooks/useOverview";
import { realHabits } from "@utils/rotina";
import { OverviewTiles } from "./OverviewTiles";
import { OverviewWeeks } from "./OverviewWeeks";
import { OverviewHabits } from "./OverviewHabits";
import { WeekTasksModal } from "./WeekTasksModal";
import "@styles/overview.css";

interface OverviewViewProps {
  showNotice: (text: string) => void;
}

export function OverviewView({ showNotice }: OverviewViewProps) {
  const { cards } = useCards(showNotice);
  const allWeeks = useAllWeeks();
  const { cig } = useCigarros(showNotice);
  const { entries } = useHabits(showNotice);
  const { areas } = useKanbanTaxonomy(showNotice);
  const { label, tiles, weekRows, habits, prevMonth, nextMonth, canGoPrev, canGoNext } = useOverview(
    realHabits(entries),
    cards,
    allWeeks,
    cig,
  );
  const [selectedWeek, setSelectedWeek] = useState<WeekRow | null>(null);

  return (
    <section
      id="view-overview"
      role="tabpanel"
      aria-labelledby="tab-overview"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div className="week-nav">
        <button type="button" aria-label="Mês anterior" onClick={prevMonth} disabled={!canGoPrev}>
          ←
        </button>
        <h2>{label}</h2>
        <button type="button" aria-label="Próximo mês" onClick={nextMonth} disabled={!canGoNext}>
          →
        </button>
      </div>
      <OverviewTiles tiles={tiles} />
      <OverviewWeeks weeks={weekRows} onSelect={setSelectedWeek} />
      <OverviewHabits habits={habits} />

      {selectedWeek && (
        <WeekTasksModal week={selectedWeek} areas={areas} onClose={() => setSelectedWeek(null)} />
      )}
    </section>
  );
}
