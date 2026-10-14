import type { AreaCategory, PriorityLevel } from "@app-types/kanban.types";
import areasData from "./areasData.json";
import prioritiesData from "./prioritiesData.json";

// Fonte estática versionada no repo. O servidor reescreve esses arquivos de
// verdade quando categorias/prioridades são criadas, editadas ou excluídas
// pela UI do Kanban — ver server/kanbanTaxonomy.ts.
export const AREAS = (areasData as AreaCategory[]).slice().sort((a, b) => a.order - b.order);
export const PRIORITIES = (prioritiesData as PriorityLevel[]).slice().sort((a, b) => a.order - b.order);
