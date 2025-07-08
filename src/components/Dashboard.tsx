import { CheckCircle, Clock, Home, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statsData = [
  {
    title: "Tarefas Pendentes",
    value: "12",
    icon: Clock,
    color: "text-terrah-orange",
    bg: "bg-terrah-orange/10"
  },
  {
    title: "Concluídas Hoje",
    value: "5",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10"
  },
  {
    title: "Atrasadas",
    value: "3",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10"
  },
  {
    title: "Imóveis Ativos",
    value: "8",
    icon: Home,
    color: "text-terrah-turquoise",
    bg: "bg-terrah-turquoise/10"
  }
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 h-12" variant="turquoise">
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
        <Button className="flex-1 h-12" variant="orange">
          <Home className="mr-2 h-4 w-4" />
          Gerenciar Imóveis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Limpeza concluída - Apto 101</p>
                <p className="text-xs text-muted-foreground">João Silva • há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-terrah-orange"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nova tarefa criada - Dedetização</p>
                <p className="text-xs text-muted-foreground">Sistema • há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-terrah-turquoise"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Manutenção iniciada - Prédio A</p>
                <p className="text-xs text-muted-foreground">Maria Santos • há 6 horas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}