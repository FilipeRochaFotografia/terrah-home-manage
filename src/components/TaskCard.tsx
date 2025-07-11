import { Calendar, Camera, Clock, MapPin, User2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  property?: string;
  assignee: string;
  photosCount: number;
  maintenanceType: string;
  responsavel?: string;
  anotacoes?: string;
}

const statusConfig = {
  pending: { label: "Em Aberto", color: "bg-muted text-muted-foreground border-muted" },
  "in-progress": { label: "Em Andamento", color: "bg-terrah-turquoise/20 text-terrah-turquoise border-terrah-turquoise/30" },
  completed: { label: "Concluída", color: "bg-success/20 text-success border-success/30" },
  paused: { label: "Pausada", color: "bg-warning/20 text-warning border-warning/30" }
};

const priorityConfig = {
  low: { color: "bg-muted text-muted-foreground border-muted" },
  medium: { color: "bg-terrah-orange/20 text-terrah-orange border-terrah-orange/30" },
  high: { color: "bg-destructive/20 text-destructive border-destructive/30" }
};

function mapStatus(status: string): "pending" | "in-progress" | "completed" | "paused" {
  switch (status) {
    case "em_aberto":
    case "pending":
      return "pending";
    case "em_andamento":
    case "in-progress":
      return "in-progress";
    case "concluida":
    case "completed":
      return "completed";
    case "pausada":
    case "paused":
      return "paused";
    default:
      return "pending";
  }
}

function mapPriority(priority: string): "low" | "medium" | "high" {
  switch (priority) {
    case "baixa":
    case "low":
      return "low";
    case "media":
    case "média":
    case "medium":
      return "medium";
    case "alta":
    case "high":
      return "high";
    default:
      return "medium";
  }
}

export function TaskCard({ 
  title, 
  description, 
  status, 
  priority, 
  dueDate, 
  property, 
  assignee, 
  photosCount,
  maintenanceType,
  responsavel,
  anotacoes
}: TaskCardProps) {
  const mappedStatus = mapStatus(status);
  const mappedPriority = mapPriority(priority);
  const isOverdue = new Date(dueDate) < new Date() && mappedStatus !== "completed";
  
  const statusValue = statusConfig[mappedStatus] || statusConfig["pending"];
  const priorityValue = priorityConfig[mappedPriority] || priorityConfig["medium"];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-l-terrah-turquoise/20 hover:border-l-terrah-turquoise">
      <CardContent className="p-6">
        {/* Header com título e badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-foreground mb-2 text-lg group-hover:text-terrah-turquoise transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`${statusValue.color} border font-medium inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`}>
              {statusValue.label}
            </div>
            <div className={`${priorityValue.color} font-medium inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`}>
              {mappedPriority === "high" ? "Alta" : mappedPriority === "medium" ? "Média" : "Baixa"}
            </div>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className={isOverdue ? "text-destructive font-semibold" : ""}>
                {new Date(dueDate).toLocaleDateString("pt-BR")}
              </span>
              {isOverdue && (
                <div className="bg-destructive text-destructive-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  Atrasada
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{maintenanceType}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {property && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{property}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <User2 className="h-4 w-4" />
              <span className="font-medium">{responsavel || assignee}</span>
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-4 w-4" />
            <span className="font-medium">{photosCount} fotos</span>
          </div>
          
          <div className="flex items-center gap-2">
            {mappedStatus === "pending" && (
              <Button 
                variant="turquoise" 
                size="sm"
                className="bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-sm hover:shadow-md transition-all duration-200"
              >
                Iniciar
              </Button>
            )}
            {mappedStatus === "in-progress" && (
              <Button 
                variant="orange" 
                size="sm"
                className="bg-gradient-to-r from-terrah-orange to-terrah-orange/90 hover:from-terrah-orange/90 hover:to-terrah-orange shadow-sm hover:shadow-md transition-all duration-200"
              >
                Concluir
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}