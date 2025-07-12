import { Calendar, Camera, Clock, MapPin, User2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useState } from 'react';

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
  responsavel?: string;
  anotacoes?: string;
  diasRestantes?: number;
  statusCor?: string;
  statusLabel?: string;
  onStart?: () => void;
  createdAt?: string;
  completedAt?: string;
  editButton?: React.ReactNode;
  className?: string;
  photos?: string[];
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
  responsavel,
  anotacoes,
  diasRestantes,
  statusCor,
  statusLabel,
  onStart,
  createdAt,
  completedAt,
  editButton,
  className,
  photos = []
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const mappedStatus = mapStatus(status);
  const mappedPriority = mapPriority(priority);
  
  const statusValue = statusConfig[mappedStatus] || statusConfig["pending"];
  const priorityValue = priorityConfig[mappedPriority] || priorityConfig["medium"];

  // Função para determinar a cor da borda baseada no tempo restante
  function getBorderColor(diasRestantes?: number): string {
    if (diasRestantes === undefined) return "border-l-terrah-turquoise/20";
    if (diasRestantes <= 5) return "border-l-red-600";
    if (diasRestantes <= 14) return "border-l-orange-500/60";
    if (diasRestantes <= 29) return "border-l-yellow-500/60";
    return "border-l-green-500/60";
  }

  const borderColor = getBorderColor(diasRestantes);

  // Se estiver atrasada, aplica fundo vermelho claro
  const isOverdue = new Date(dueDate) < new Date() && mappedStatus !== "completed";
  const overdueBg = isOverdue ? "bg-red-500/5" : "";

  const isCompleted = mappedStatus === "completed";
  const completedBg = isCompleted ? "bg-blue-500/5" : "";

  // Só permite expandir se for concluída
  const handleExpand = () => {
    if (isCompleted) setExpanded((v) => !v);
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-l-4 ${borderColor} hover:${borderColor.replace('/60', '/80')} ${overdueBg} ${completedBg} ${className || ''} ${isCompleted ? 'cursor-pointer' : ''}`}
      onClick={handleExpand}
    >
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
            {diasRestantes !== undefined && statusLabel && !isCompleted && (
              <Badge 
                variant="outline" 
                className={`${statusCor} border font-medium text-xs font-semibold`}
              >
                {statusLabel} ({diasRestantes} dia{diasRestantes !== 1 ? 's' : ''})
              </Badge>
            )}
          </div>
        </div>

        {/* Galeria de fotos (apenas se concluída e houver fotos) */}
        {isCompleted && photos && photos.length > 0 && !expanded && (
          <div className="flex gap-2 flex-wrap mb-4">
            {photos.slice(0, 3).map((url, idx) => (
              <img key={idx} src={url} alt={`Foto ${idx+1}`} className="w-16 h-16 object-cover rounded border" />
            ))}
            {photos.length > 3 && <span className="text-xs text-muted-foreground">+{photos.length - 3} mais</span>}
          </div>
        )}

        {/* Expansão: anotações completas e galeria grande */}
        {isCompleted && expanded && (
          <div className="mb-4">
            {anotacoes && (
              <div className="mb-2">
                <span className="block text-sm font-semibold text-terrah-turquoise mb-1">Anotações:</span>
                <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted/40 rounded p-2">{anotacoes}</div>
              </div>
            )}
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {photos.map((url, idx) => (
                  <img key={idx} src={url} alt={`Foto ${idx+1}`} className="w-28 h-28 object-cover rounded border" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Informações detalhadas */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(dueDate).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Manutenção</span>
            </div>
            {createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Criada: {new Date(createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            {completedAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Concluída: {new Date(completedAt).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
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
            <span className="font-medium">{photos.length} fotos</span>
          </div>
          <div className="flex items-center gap-2">
            {mappedStatus === "pending" && (
              <Button 
                variant="turquoise" 
                size="sm"
                className="bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-sm hover:shadow-md transition-all duration-200"
                onClick={onStart}
              >
                Iniciar
              </Button>
            )}
            {isCompleted && (
              <Button 
                variant="orange" 
                size="sm"
                className="bg-orange-500/80 text-white cursor-default" 
                disabled
              >
                Concluída
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
            {editButton}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}