import { CheckCircle, Clock, Home, Plus, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statsData = [
  {
    title: "Tarefas Pendentes",
    value: "12",
    icon: Clock,
    color: "text-terrah-orange",
    bg: "bg-terrah-orange/10",
    trend: "+2",
    trendUp: true
  },
  {
    title: "Concluídas Hoje",
    value: "5",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    trend: "+1",
    trendUp: true
  },
  {
    title: "Atrasadas",
    value: "3",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    trend: "-1",
    trendUp: false
  },
  {
    title: "Imóveis Ativos",
    value: "8",
    icon: Home,
    color: "text-terrah-turquoise",
    bg: "bg-terrah-turquoise/10",
    trend: "0",
    trendUp: true
  }
];

export function Dashboard() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="flex-1 h-12 bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
          variant="turquoise"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
        <Button 
          className="flex-1 h-12 bg-gradient-to-r from-terrah-orange to-terrah-orange/90 hover:from-terrah-orange/90 hover:to-terrah-orange shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
          variant="orange"
        >
          <Home className="mr-2 h-4 w-4" />
          Gerenciar Imóveis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradiente sutil de fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-terrah-turquoise/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shadow-sm`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className={`h-3 w-3 ${stat.trendUp ? 'text-success' : 'text-destructive'}`} />
                  <span className={`font-medium ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-terrah-turquoise" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-success/5 to-success/10 border border-success/20 hover:shadow-md transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Limpeza concluída - Apto 101</p>
                <p className="text-xs text-muted-foreground">João Silva • há 2 horas</p>
              </div>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-terrah-orange/5 to-terrah-orange/10 border border-terrah-orange/20 hover:shadow-md transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-terrah-orange animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Nova tarefa criada - Dedetização</p>
                <p className="text-xs text-muted-foreground">Sistema • há 4 horas</p>
              </div>
              <Plus className="h-4 w-4 text-terrah-orange" />
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-terrah-turquoise/5 to-terrah-turquoise/10 border border-terrah-turquoise/20 hover:shadow-md transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-terrah-turquoise animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Manutenção iniciada - Prédio A</p>
                <p className="text-xs text-muted-foreground">Maria Santos • há 6 horas</p>
              </div>
              <Clock className="h-4 w-4 text-terrah-turquoise" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}