// Tipos para eventos customizados usados no projeto

export type TabName = 'dashboard' | 'tasks' | 'properties' | 'employees' | 'reports';
export interface NavigateToTabEvent extends CustomEvent<TabName> {}

export interface OpenTaskModalEvent extends CustomEvent<void> {}

export type TaskColorFilter = 'all' | 'urgentesEatrasadas' | 'concluidas' | 'em_aberto';
export interface SetTaskColorFilterEvent extends CustomEvent<TaskColorFilter> {}

export type TaskStatusFilter = 'all' | 'em_aberto' | 'em_andamento' | 'concluida' | 'cancelada';
export interface SetStatusFilterEvent extends CustomEvent<TaskStatusFilter> {}

export interface FilterTasksByPropertyDetail {
  imovelId: string;
  status?: 'em_aberto' | 'concluida';
}
export interface FilterTasksByPropertyEvent extends CustomEvent<FilterTasksByPropertyDetail> {}

export interface FilterTasksByIdEvent extends CustomEvent<string> {}

export interface ClearTaskIdFilterEvent extends CustomEvent<void> {}
export interface ClearColorFilterEvent extends CustomEvent<void> {}
export interface RefreshPredefinedTasksEvent extends CustomEvent<void> {}
export interface RefreshNotificationsEvent extends CustomEvent<void> {}

// Evento simples para indicar que tarefas foram atualizadas
export interface TarefasAtualizadasEvent extends Event {} 