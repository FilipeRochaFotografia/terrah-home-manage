import { Calendar, Camera, Clock, MapPin, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "paused";
  priority: "low" | "medium" | "high";
  dueDate: string;
  property?: string;
  assignee: string;
  photosCount: number;
  maintenanceType: string;
}

const statusConfig = {
  pending: { label: "Em Aberto", color: "bg-muted text-muted-foreground" },
  "in-progress": { label: "Em Andamento", color: "bg-terrah-turquoise/20 text-terrah-turquoise" },
  completed: { label: "Concluída", color: "bg-success/20 text-success" },
  paused: { label: "Pausada", color: "bg-warning/20 text-warning" }
};

const priorityConfig = {
  low: { color: "bg-muted text-muted-foreground" },
  medium: { color: "bg-terrah-orange/20 text-terrah-orange" },
  high: { color: "bg-destructive/20 text-destructive" }
};

export function TaskCard({ 
  title, 
  description, 
  status, 
  priority, 
  dueDate, 
  property, 
  assignee, 
  photosCount,
  maintenanceType 
}: TaskCardProps) {
  const isOverdue = new Date(dueDate) < new Date() && status !== "completed";
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={statusConfig[status].color}>
              {statusConfig[status].label}
            </Badge>
            <Badge variant="outline" className={priorityConfig[priority].color}>
              {priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? "text-destructive font-medium" : ""}>
                {new Date(dueDate).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{maintenanceType}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {property && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{property}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <User2 className="h-3 w-3" />
              <span>{assignee}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Camera className="h-3 w-3" />
            <span>{photosCount} fotos</span>
          </div>
          
          <div className="flex gap-2">
            {status === "pending" && (
              <Button variant="turquoise" size="sm">
                Iniciar
              </Button>
            )}
            {status === "in-progress" && (
              <Button variant="orange" size="sm">
                Concluir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}