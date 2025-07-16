import { Calendar, Camera, Clock, MapPin, User2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoGallery } from "./PhotoGallery";
import React, { useState } from 'react';
import { formatarPeriodicidade } from "@/lib/utils";

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
  periodicidade?: string;
  proximaTarefa?: string;
}

const statusConfig = {
  pending: { label: "Em Aberto", color: "bg-muted text-muted-foreground border-muted" },
  "in-progress": { label: "Em Andamento", color: "bg-terrah-turquoise/20 text-terrah-turquoise border-terrah-turquoise/30" },
  completed: { label: "Concluída", color: "bg-success/20 text-success border-success/30" },
  paused: { label: "Pausada", color: "bg-warning/20 text-warning border-warning/30" }
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
  photos = [],
  periodicidade,
  proximaTarefa
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const mappedStatus = mapStatus(status);
  
  const statusValue = statusConfig[mappedStatus] || statusConfig["pending"];

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
  const isPending = mappedStatus === "pending";
  const isInProgress = mappedStatus === "in-progress";
  const completedBg = isCompleted ? "bg-blue-500/5" : "";

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoModalOpen(true);
  };

  return (
    <>
      <Card 
        className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${borderColor} ${overdueBg} ${completedBg} ${className || ''} cursor-pointer`}
        onClick={handleToggleExpand}
      >
      <CardContent className="p-4">
        {/* Header compacto */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1 text-lg">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              Manutenção
            </p>
          </div>
        </div>

        {/* Informações principais - layout específico para concluídas */}
        {isCompleted ? (
          <div className="space-y-2 mb-3 text-base">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Criada em: {createdAt ? new Date(createdAt).toLocaleDateString("pt-BR") : '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground ml-8">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{property || '-'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Concluída em: {completedAt ? new Date(completedAt).toLocaleDateString("pt-BR") : '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground ml-8">
                <User2 className="h-4 w-4" />
                <span className="text-sm font-medium">{responsavel || assignee}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Layout normal para tarefas pendentes */
          <div className="space-y-2 mb-3 text-base">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Criada em: {createdAt ? new Date(createdAt).toLocaleDateString("pt-BR") : '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground ml-8">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{property || '-'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Prazo Final: {new Date(dueDate).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground ml-8">
                <User2 className="h-4 w-4" />
                <span className="text-sm font-medium">{responsavel || assignee}</span>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo expandido */}
        {expanded && (
          <div className="mb-3 space-y-3">
            {/* Descrição completa - apenas para tarefas não concluídas */}
            {!isCompleted && (
              <div>
                <span className="block text-base font-medium text-foreground mb-1">Descrição:</span>
                <p className="text-base text-muted-foreground bg-muted/40 rounded p-2">{description}</p>
              </div>
            )}

            {/* Anotações (sempre visível quando expandido e houver anotações) */}
            {anotacoes && (
              <div>
                <span className="block text-base font-medium text-foreground mb-1">Anotações:</span>
                <div className="text-base text-muted-foreground whitespace-pre-line bg-muted/40 rounded p-2">{anotacoes}</div>
              </div>
            )}

            {/* Informações de recorrência (apenas para tarefas concluídas) */}
            {isCompleted && (
              <div className="space-y-2">
                {periodicidade && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-base">Recorrência: {formatarPeriodicidade(periodicidade)}</span>
                  </div>
                )}
                {proximaTarefa && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-base font-medium">Próxima tarefa: {new Date(proximaTarefa).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Fotos (apenas para tarefas concluídas e quando expandido) */}
            {isCompleted && photos.length > 0 && (
              <div>
                <span className="block text-base font-medium text-foreground mb-2">Fotos ({photos.length}):</span>
                <div className="flex gap-2 flex-wrap">
                  {photos.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="relative">
                      <img 
                        src={url} 
                        alt={`Foto ${idx+1}`} 
                        className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePhotoClick(idx);
                        }}
                      />
                      {idx === 3 && photos.length > 4 && (
                        <div 
                          className="absolute inset-0 bg-black/60 flex items-center justify-center rounded cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhotoClick(4);
                          }}
                        >
                          <span className="text-white text-sm font-bold">+{photos.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer com botões */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {/* Botão Concluída para tarefas concluídas */}
            {isCompleted && (
              <Button 
                variant="secondary"
                size="sm"
                className="bg-green-500/20 text-green-700 cursor-default" 
                disabled
                onClick={(e) => e.stopPropagation()}
              >
                Concluída
              </Button>
            )}

            {/* Indicação de fotos no card pequeno (apenas para concluídas) */}
            {isCompleted && (
              <>
                {photos.length > 0 ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm text-muted-foreground hover:text-foreground p-1 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalOpen(true);
                    }}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    {photos.length} foto{photos.length > 1 ? 's' : ''}
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm text-muted-foreground p-1 h-auto cursor-default" 
                    disabled
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    0 fotos
                  </Button>
                )}
              </>
            )}

            {/* Badge de dias restantes para tarefas pendentes */}
            {!isCompleted && diasRestantes !== undefined && statusLabel && (
              <Badge 
                className={`${statusCor} text-sm border-0`}
              >
                {statusLabel} ({diasRestantes} dia{diasRestantes !== 1 ? 's' : ''})
              </Badge>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            {isPending && (
              <Button 
                variant="default"
                size="sm"
                className="bg-terrah-turquoise hover:bg-terrah-turquoise/90 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onStart?.();
                }}
              >
                Iniciar
              </Button>
            )}
            {isInProgress && (
              <Button 
                variant="default"
                size="sm"
                className="bg-terrah-orange hover:bg-terrah-orange/90 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                Concluir
              </Button>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              {editButton}
            </div>
          </div>
        </div>
      </CardContent>
      </Card>

      <PhotoGallery 
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        photos={photos}
        initialIndex={selectedPhotoIndex}
        taskTitle={title}
      />
    </>
  );
}