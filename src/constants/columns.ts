import type { KanbanColumnDef } from "@app-types/kanban.types";
import columnsData from "./columnsData.json";

// Fonte estática versionada no repo. O servidor reescreve esse arquivo de
// verdade quando colunas são criadas, renomeadas ou reordenadas pela UI do
// Kanban — ver server/kanbanColumns.ts.
export const COLUMNS = (columnsData as KanbanColumnDef[]).slice().sort((a, b) => a.order - b.order);
