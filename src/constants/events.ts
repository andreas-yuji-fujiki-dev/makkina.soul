// Disparado depois que uma ação do Claude edita a rotina no servidor, pra
// qualquer componente com useHabits montado atualizar sem precisar de polling.
export const ROTINA_HABITS_CHANGED_EVENT = "rotina-habits-changed";

// Disparado depois de criar/editar/excluir uma categoria ou prioridade do
// Kanban no servidor, pra qualquer componente com useKanbanTaxonomy montado
// atualizar sem precisar de polling.
export const KANBAN_TAXONOMY_CHANGED_EVENT = "kanban-taxonomy-changed";

// Disparado depois de criar/renomear/reordenar uma coluna do Kanban no
// servidor, pra qualquer componente com useKanbanColumns montado atualizar
// sem precisar de polling.
export const KANBAN_COLUMNS_CHANGED_EVENT = "kanban-columns-changed";
