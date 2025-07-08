import { Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./TaskCard";

const mockTasks = [
  {
    id: "1",
    title: "Limpeza Geral - Área Comum",
    description: "Limpeza completa do hall de entrada, escadas e corredores do Prédio A",
    status: "pending" as const,
    priority: "high" as const,
    dueDate: "2024-07-10",
    property: "Prédio A - Hall",
    assignee: "João Silva",
    photosCount: 0,
    maintenanceType: "Limpeza"
  },
  {
    id: "2",
    title: "Dedetização - Apto 205",
    description: "Aplicação de produtos contra pragas urbanas no apartamento 205",
    status: "in-progress" as const,
    priority: "medium" as const,
    dueDate: "2024-07-12",
    property: "Apto 205",
    assignee: "Maria Santos",
    photosCount: 2,
    maintenanceType: "Dedetização"
  },
  {
    id: "3",
    title: "Verificação Hidráulica",
    description: "Inspeção preventiva do sistema hidráulico da cobertura",
    status: "completed" as const,
    priority: "low" as const,
    dueDate: "2024-07-08",
    property: "Cobertura",
    assignee: "Carlos Pereira",
    photosCount: 5,
    maintenanceType: "Hidráulica"
  },
  {
    id: "4",
    title: "Manutenção Elevador",
    description: "Revisão mensal do sistema de elevadores - Torre B",
    status: "paused" as const,
    priority: "high" as const,
    dueDate: "2024-07-09",
    property: "Torre B - Elevador",
    assignee: "Roberto Lima",
    photosCount: 1,
    maintenanceType: "Mecânica"
  }
];

export function TaskList() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar tarefas..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="turquoise">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="space-y-3">
        {mockTasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>
    </div>
  );
}