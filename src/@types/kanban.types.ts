// Categorias e prioridades são listas editáveis (src/constants/areasData.json
// e prioritiesData.json), não um enum fixo — por isso o id é uma string/number
// estável e independente do rótulo exibido, que pode ser renomeado.
export type Area = string;
export type Priority = number;

export interface AreaCategory {
  id: Area;
  label: string;
  order: number;
  defaultPrio: Priority;
}

export interface PriorityLevel {
  id: Priority;
  label: string;
  order: number;
}

// Colunas também são uma lista editável (src/constants/columnsData.json):
// por padrão vêm "A fazer"/"Fazendo"/"Feito", mas dá pra criar, renomear e
// reordenar. O id "doing" carrega o limite de 3 cartões simultâneos (wipLimit)
// desde a seed; colunas novas criadas pela UI nascem sem limite.
export type ColumnId = string;

export interface KanbanColumnDef {
  id: ColumnId;
  label: string;
  order: number;
  wipLimit?: number;
}

export interface Card {
  id: string;
  title: string;
  note: string;
  area: Area;
  prio: Priority;
  col: ColumnId;
  created: number;
  movedAt: number;
  order: number;
}

export type CardSeed = Omit<Card, "id">;

export type TaxonomyAction =
  | { type: "add_area"; label: string; defaultPrio: Priority }
  | { type: "update_area"; id: Area; label?: string; defaultPrio?: Priority }
  | { type: "delete_area"; id: Area }
  | { type: "add_priority"; label: string }
  | { type: "update_priority"; id: Priority; label: string }
  | { type: "delete_priority"; id: Priority };

export type ColumnAction =
  | { type: "add_column"; label: string }
  | { type: "update_column"; id: ColumnId; label: string }
  | { type: "reorder_column"; id: ColumnId; beforeId?: string; afterId?: string };
