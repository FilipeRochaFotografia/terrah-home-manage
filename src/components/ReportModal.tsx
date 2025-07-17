import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, UserCheck } from "lucide-react";

interface TarefaDetalhada {
  id: string;
  titulo: string;
  imovel?: string;
  responsavel?: string;
  diasRestantes: number;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  count: number;
  color: string;
  tasks: TarefaDetalhada[];
  loading: boolean;
}

function getStatusCor(diasRestantes: number): string {
  if (diasRestantes <= 5) return 'text-destructive bg-destructive/10';
  if (diasRestantes <= 14) return 'text-terrah-orange bg-terrah-orange/10';
  if (diasRestantes <= 29) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
}

export function ReportModal({ isOpen, onClose, title, count, color, tasks, loading }: ReportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <div className="p-2">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
              <span className="text-3xl font-bold text-white">{count}</span>
            </div>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </div>
          
          {loading ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-4">
              {tasks.length > 0 ? (
                tasks.map(tarefa => (
                  <div key={tarefa.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{tarefa.titulo}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span><MapPin className="h-3 w-3 inline mr-1"/>{tarefa.imovel}</span>
                        <span><UserCheck className="h-3 w-3 inline mr-1"/>{tarefa.responsavel}</span>
                        <Badge variant="outline" className={getStatusCor(tarefa.diasRestantes)}>
                          {tarefa.diasRestantes < 0 
                            ? `Atrasada ${-tarefa.diasRestantes}d` 
                            : `Vence em ${tarefa.diasRestantes}d`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-8">Nenhuma tarefa encontrada para este critério.</div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 