import type { CigarrosDayCell } from "@app-types/cigarros.types";

interface CigDaysGridProps {
  cells: CigarrosDayCell[];
}

export function CigDaysGrid({ cells }: CigDaysGridProps) {
  return (
    <div className="cig-days">
      {cells.map((cell) => {
        const classes = ["cig-cell"];
        if (cell.isToday) classes.push("today");
        if (cell.isFuture) classes.push("future");
        else if (cell.hasValue) classes.push(cell.value <= cell.limit ? "ok" : "over");
        return (
          <div key={cell.day} className={classes.join(" ")}>
            <b>{cell.value}</b>
            <span>
              Dia {cell.day}
              {!cell.isFuture ? ` · lim ${cell.limit}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
