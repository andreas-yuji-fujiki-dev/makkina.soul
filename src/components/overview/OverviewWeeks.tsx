import type { WeekRow } from "@app-types/overview.types";
import { fmt } from "@utils/date";

interface OverviewWeeksProps {
  weeks: WeekRow[];
  onSelect: (week: WeekRow) => void;
}

export function OverviewWeeks({ weeks, onSelect }: OverviewWeeksProps) {
  return (
    <div className="ov-weeks">
      {weeks.map((week) => {
        const classes = ["ov-week"];
        if (week.isCurrent) classes.push("current");
        if (week.isFuture) classes.push("future");
        if (!week.isFuture) classes.push("clickable");
        return (
          <div
            className={classes.join(" ")}
            key={week.index}
            role={week.isFuture ? undefined : "button"}
            tabIndex={week.isFuture ? undefined : 0}
            onClick={week.isFuture ? undefined : () => onSelect(week)}
            onKeyDown={
              week.isFuture
                ? undefined
                : (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(week);
                    }
                  }
            }
          >
            <div>
              <b>Semana {week.index}</b>
              <small>
                {fmt(week.mondayDate)} a {fmt(week.sundayDate)}
                {week.isCurrent ? " · em andamento" : ""}
              </small>
            </div>
            <div className="ov-bar-wrap">
              <small>Rotina</small>
              <div className="ov-bar">
                <i style={{ width: `${week.percent}%` }} />
              </div>
              <span>{week.isFuture ? "—" : `${week.percent}%`}</span>
            </div>
            <div className="ov-stat">
              <b>{week.isFuture ? "—" : String(week.stats.tasks)}</b>
              <small>tarefas feitas</small>
            </div>
            <div className="ov-stat">
              <b>{week.isFuture || !week.stats.cLog ? "—" : `${week.stats.cOk}/${week.stats.cLog}`}</b>
              <small>dias no limite</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
