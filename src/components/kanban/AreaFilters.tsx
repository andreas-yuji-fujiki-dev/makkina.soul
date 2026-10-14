import type { AreaCategory, Card } from "@app-types/kanban.types";
import { visibleAreaFilters } from "@utils/kanban";

interface AreaFiltersProps {
  cards: Card[];
  areas: AreaCategory[];
  active: string;
  onChange: (area: string) => void;
}

export function AreaFilters({ cards, areas, active, onChange }: AreaFiltersProps) {
  const options = visibleAreaFilters(cards, areas);

  return (
    <div className="filters" role="group" aria-label="Filtrar por área">
      {options.map(({ area, label, count }) => (
        <button
          key={area}
          type="button"
          aria-pressed={area === active}
          onClick={() => onChange(area)}
        >
          {label} {count}
        </button>
      ))}
    </div>
  );
}
