import type { AreaCategory } from "@app-types/kanban.types";
import type { WeekRow } from "@app-types/overview.types";
import { Modal } from "@components/layout/Modal";
import { fmt } from "@utils/date";

interface WeekTasksModalProps {
  week: WeekRow;
  areas: AreaCategory[];
  onClose: () => void;
}

export function WeekTasksModal({ week, areas, onClose }: WeekTasksModalProps) {
  const { doneCards } = week.stats;

  return (
    <Modal onClose={onClose} labelledBy="week-tasks-title">
      <h2 id="week-tasks-title">
        Semana {week.index} · {fmt(week.mondayDate)} a {fmt(week.sundayDate)}
      </h2>
      {doneCards.length === 0 ? (
        <p className="lede">Nenhuma tarefa concluída nessa semana.</p>
      ) : (
        <ul className="week-tasks-list">
          {doneCards.map((c) => (
            <li key={c.id}>
              <b>{c.title}</b>
              <small>{areas.find((a) => a.id === c.area)?.label ?? c.area}</small>
            </li>
          ))}
        </ul>
      )}
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}
