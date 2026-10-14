import type { HabitProgress } from "@app-types/overview.types";

interface OverviewHabitsProps {
  habits: HabitProgress[];
}

export function OverviewHabits({ habits }: OverviewHabitsProps) {
  return (
    <div className="panel">
      <h3 className="ov-h3">Hábitos no mês</h3>
      <div className="ov-habits">
        {habits.map((h) => (
          <div className="ov-habit" key={h.id}>
            <div>
              <b>{h.title}</b>
              <span>
                {h.done}/{h.total}
              </span>
            </div>
            <div className="ov-bar">
              <i style={{ width: `${h.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
