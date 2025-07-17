import { Bell, Settings, User, ClipboardList, Clock, AlertTriangle, CheckCircle, FileText, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { Switch } from "@/components/ui/switch"; // Importar o Switch
import { Separator } from "@/components/ui/separator"; // Importar o Separator
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import type { RefreshNotificationsEvent, NavigateToTabEvent, FilterTasksByIdEvent, RefreshPredefinedTasksEvent } from "@/types/events";
import { useAuth } from "@/contexts/AuthContext";

interface PredefinedTask {
  id: string;
  titulo: string;
  descricao: string;
  periodicidade: string;
  observacao?: string;
}

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  ativo: boolean;
  is_admin: boolean;
}

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Novo estado para o modal de configurações
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPredefinedTasksModal, setShowPredefinedTasksModal] = useState(false);
  const [predefinedTasks, setPredefinedTasks] = useState<PredefinedTask[]>([]);
  const [editingPredefinedTask, setEditingPredefinedTask] = useState<PredefinedTask | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState<string>("");
  const [exportType, setExportType] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [predefinedTaskToDelete, setPredefinedTaskToDelete] = useState<string | null>(null);

  const { userInfo, isAdmin, user } = useAuth();

  // Usar o novo hook de notificações
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    loadNotifications
  } = useNotifications();

  // Recarregar notificações quando o modal for aberto
  useEffect(() => {
    if (showNotifications) {
      loadNotifications();
    }
  }, [showNotifications, loadNotifications]);

  // **NOVO: Listener para refresh automático de notificações**
  useEffect(() => {
    const handleRefreshNotifications = (e: Event) => {
      const event = e as RefreshNotificationsEvent;
      loadNotifications();
    };

    window.addEventListener('refreshNotifications', handleRefreshNotifications);

    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, [loadNotifications]);

  // **NOVO: Refresh automático a cada 30 segundos**
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []); // Removido loadNotifications das dependências para evitar vazamento

  // Buscar funcionários para o modal de equipe
  useEffect(() => {
    if (showTeamModal) {
      supabase.from("funcionarios").select("id, nome, cargo, ativo, is_admin").then(({ data }) => {
        if (data) setFuncionarios(data);
      });
    }
  }, [showTeamModal]);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  // Função de logout
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // Função para dar/remover admin
  async function handleToggleAdmin() {
    if (!selectedFuncionario) return;
    const funcionario = funcionarios.find(f => f.id === selectedFuncionario);
    const novoStatus = !funcionario?.is_admin;
    await supabase.from("funcionarios").update({ is_admin: novoStatus }).eq("id", selectedFuncionario);
    toast.success(novoStatus ? "Privilégio de admin concedido." : "Privilégio de admin removido.");
    setShowTeamModal(false);
  }

  // Função para exportar relatório
  function handleExport() {
    if (!exportType) return;
    toast.success(`Relatório ${exportType === "semanal" ? "semanal" : "mensal"} exportado! (simulação)`);
    setShowExportModal(false);
  }

  const notificacoesCount = unreadCount;

  // Função para renderizar ícone baseado no tipo de notificação
  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'task_assigned':
        return <ClipboardList className="h-4 w-4 text-terrah-orange" />;
      case 'task_due_soon':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'task_overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Função para formatar o tipo de notificação
  const formatNotificationType = (tipo: string) => {
    switch (tipo) {
      case 'task_assigned':
        return 'Nova Tarefa';
      case 'task_due_soon':
        return 'Vence em Breve';
      case 'task_overdue':
        return 'Em Atraso';
      case 'task_completed':
        return 'Concluída';
      default:
        return tipo;
    }
  };

  // Efeito para buscar tarefas predefinidas quando o modal for aberto
  useEffect(() => {
    async function fetchPredefinedTasks() {
      if (showPredefinedTasksModal) {
        const { data, error } = await supabase.from("tarefas_predefinidas").select("*").order("titulo");
        if (error) {
          toast.error("Erro ao buscar tarefas padrão.");
        } else {
          setPredefinedTasks(data);
        }
      }
    }
    fetchPredefinedTasks();
  }, [showPredefinedTasksModal]);
  
  const handleSavePredefinedTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const titulo = formData.get("titulo") as string;
    
    const taskData = {
      titulo: titulo,
      descricao: formData.get("descricao") as string,
      periodicidade: formData.get("periodicidade") as string,
      observacao: formData.get("observacao") as string,
    };

    if (editingPredefinedTask?.id) {
      // Editar
      const { error } = await supabase.from("tarefas_predefinidas").update(taskData).eq("id", editingPredefinedTask.id);
      if (error) {
        toast.error(`Erro ao atualizar tarefa: ${error.message}`);
      } else {
        toast.success("Tarefa padrão atualizada!");
        const refreshEvent: RefreshPredefinedTasksEvent = new CustomEvent('refreshPredefinedTasks');
        window.dispatchEvent(refreshEvent);
      }
    } else {
      // Criar
      // Gerar ID a partir do título (ex: "Limpar Piscina" -> "limpar-piscina")
      const newId = titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const { error } = await supabase.from("tarefas_predefinidas").insert({ ...taskData, id: newId });
      if (error) {
        toast.error(`Erro ao criar tarefa: ${error.message}`);
      } else {
        toast.success("Nova tarefa padrão criada!");
        const refreshEvent: RefreshPredefinedTasksEvent = new CustomEvent('refreshPredefinedTasks');
        window.dispatchEvent(refreshEvent);
      }
    }
    
    setEditingPredefinedTask(null);
    
    // Recarrega a lista para mostrar a nova tarefa
    const { data } = await supabase.from("tarefas_predefinidas").select("*").order("titulo");
    if (data) {
      setPredefinedTasks(data);
    }
  };
  
  const handleDeletePredefinedTask = async (id: string) => {
    setPredefinedTaskToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeletePredefinedTask = async () => {
    if (!predefinedTaskToDelete) return;
    const { error } = await supabase.from("tarefas_predefinidas").delete().eq("id", predefinedTaskToDelete);
    if (error) {
      toast.error("Erro ao excluir tarefa.");
    } else {
      toast.success("Tarefa padrão excluída.");
      setPredefinedTasks(predefinedTasks.filter(p => p.id !== predefinedTaskToDelete));
      window.dispatchEvent(new Event('refreshPredefinedTasks'));
    }
    setShowDeleteDialog(false);
    setPredefinedTaskToDelete(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="relative overflow-hidden">
        
        <div className="relative flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 group">
            <div className="relative">
          <img 
                src="/lovable-uploads/logo.png" 
            alt="Terrah Homes" 
                className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
          />
            </div>
          <div>
              <h1 className="text-2xl font-bold text-terrah-orange">
                Terrah Homes
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Gestão de Tarefas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-terrah-turquoise/10 transition-colors duration-200"
              onClick={() => setShowNotifications(true)}
            >
            <Bell className="h-5 w-5" />
              {notificacoesCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-terrah-orange text-xs text-white flex items-center justify-center font-bold animate-pulse">
                  {notificacoesCount}
                </span>
              )}
          </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-terrah-turquoise/10 transition-colors duration-200"
              onClick={() => setShowSettingsModal(true)}
            >
            <Settings className="h-5 w-5" />
          </Button>
            <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-terrah-turquoise/10 transition-colors duration-200"
                onClick={() => setShowProfileMenu((v) => !v)}
                aria-label="Abrir menu do perfil"
            >
            <User className="h-5 w-5" />
          </Button>
              {showProfileMenu && (
                <>
                  {/* Backdrop para fechar ao clicar fora */}
                  <div
                    className="fixed inset-0 z-[99]"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="fixed top-16 right-4 w-56 bg-white border rounded-lg shadow-lg z-[100] animate-in fade-in duration-200">
                    {/* Topo com dados do usuário */}
                    {userInfo && (
                      <div className="px-4 py-2 border-b">
                        <div className="font-bold">{userInfo.nome}</div>
                        <div className="text-xs text-muted-foreground">{userInfo.email}</div>
                        {userInfo.isAdmin && (
                          <div className="mt-1">
                            <span className="text-xs bg-terrah-turquoise/20 text-terrah-turquoise rounded px-2 py-0.5">Admin</span>
                          </div>
                        )}
                      </div>
                    )}
                    <button className="w-full text-left px-4 py-2 hover:bg-terrah-turquoise/10" onClick={() => { setShowTeamModal(true); setShowProfileMenu(false); }}>Gerenciar equipes e permissões</button>
                    <button className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10" onClick={handleLogout}>Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Modal de notificações */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setShowNotifications(false)}>
            <div className="bg-white rounded-lg shadow-xl mt-20 mr-8 w-full max-w-sm p-6 relative animate-in slide-in-from-top-4 duration-300" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => { setShowNotifications(false); }}>&times;</button>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-terrah-orange" /> Notificações
              </h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma notificação encontrada.</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {notifications.length} notificação{notifications.length !== 1 ? 'es' : ''}
                    </span>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-terrah-turquoise hover:underline"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`border rounded-lg p-3 flex flex-col gap-1 cursor-pointer hover:bg-terrah-turquoise/5 transition ${
                          n.status === 'enviada' ? 'bg-terrah-orange/5' : 'bg-muted/20'
                        }`}
                        onClick={() => {
                          // Marcar como lida
                          markAsRead(n.id);
                          
                          // Navegar para a tarefa se existir
                          if (n.task_id) {
                            const navEvent: NavigateToTabEvent = new CustomEvent('navigateToTab', { detail: 'tasks' });
                            window.dispatchEvent(navEvent);
                            setTimeout(() => {
                              const filterEvent: FilterTasksByIdEvent = new CustomEvent('filterTasksById', { detail: n.task_id as string });
                              window.dispatchEvent(filterEvent);
                            }, 100);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(n.tipo)}
                            <span className="font-semibold text-terrah-orange">{formatNotificationType(n.tipo)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(n.enviada_em).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{n.titulo}</span>
                        <span className="text-sm text-muted-foreground">{n.mensagem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Modal Gerenciar Equipes */}
      <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar equipes e permissões</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {funcionarios.length === 0 ? (
              <div className="text-center text-muted-foreground">Nenhum funcionário encontrado.</div>
            ) : (
              <ul className="space-y-3">
                {funcionarios.map(f => (
                  <li key={f.id} className="flex items-center justify-between gap-2 border-b pb-2">
                    <div>
                      <div className="font-medium">{f.nome}</div>
                      <div className="text-xs text-muted-foreground">{f.cargo || "Usuário"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={f.is_admin ? "text-terrah-turquoise font-semibold" : "text-muted-foreground"}>
                        {f.is_admin ? "Admin" : "Usuário"}
                      </span>
                      <button
                        className={`px-3 py-1 rounded transition text-xs font-semibold ${f.is_admin ? "bg-terrah-turquoise/80 text-white" : "bg-muted text-foreground"}`}
                        onClick={async () => {
                          await supabase.from("funcionarios").update({ is_admin: !f.is_admin }).eq("id", f.id);
                          setFuncionarios(funcionarios.map(ff => ff.id === f.id ? { ...ff, is_admin: !f.is_admin } : ff));
                          toast.success(!f.is_admin ? "Privilégio de admin concedido." : "Privilégio de admin removido.");
                        }}
                      >
                        {f.is_admin ? "Remover admin" : "Tornar admin"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal Exportar Relatórios */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Relatórios</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} disabled={!exportType} className="w-full">Exportar</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Configurações */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Configurações
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <label htmlFor="notifications-switch" className="font-medium text-sm">
                Notificações Push
              </label>
              <Switch id="notifications-switch" defaultChecked className="data-[state=checked]:bg-terrah-turquoise" />
            </div>

            <Button variant="outline" className="w-full justify-start gap-2 hover:border-terrah-turquoise/50 hover:text-terrah-turquoise" onClick={() => {
              setShowSettingsModal(false);
              setShowPredefinedTasksModal(true);
            }}>
              <ClipboardList className="h-4 w-4" /> Gerenciar Tarefas Padrão
            </Button>

            <Button variant="outline" className="w-full justify-start gap-2 hover:border-terrah-turquoise/50 hover:text-terrah-turquoise" onClick={() => {
              setShowSettingsModal(false);
              setShowExportModal(true);
            }}>
              <FileText className="h-4 w-4" /> Exportar Relatórios
            </Button>
            
            <Separator />
            
            <div className="text-xs text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Licença</span>
                <span className="font-mono">MIT</span>
              </div>
              <div className="flex justify-between">
                <span>Versão</span>
                <span className="font-mono">0.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Contato</span>
                <a href="mailto:suporte@terrah.com.br" className="text-terrah-turquoise hover:underline">
                  suporte@terrah.com.br
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal para Gerenciar Tarefas Padrão */}
      <Dialog open={showPredefinedTasksModal} onOpenChange={setShowPredefinedTasksModal}>
        <DialogContent className="max-w-lg w-full sm:px-6 px-3">
          <DialogHeader>
            <DialogTitle>Gerenciar Tarefas Padrão</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto px-2 sm:px-3">
            {predefinedTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
                <span className="font-medium">{task.titulo}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingPredefinedTask(task)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePredefinedTask(task.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={() => setEditingPredefinedTask({ id: "", titulo: "", descricao: "", periodicidade: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Criar Nova Tarefa Padrão
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Modal para Criar/Editar Tarefa Padrão */}
      <Dialog open={!!editingPredefinedTask} onOpenChange={() => setEditingPredefinedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPredefinedTask?.id ? "Editar" : "Criar"} Tarefa Padrão</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePredefinedTask} className="space-y-4">
            <Input name="titulo" placeholder="Título" defaultValue={editingPredefinedTask?.titulo || ""} required />
            <Textarea name="descricao" placeholder="Descrição" defaultValue={editingPredefinedTask?.descricao || ""} required />
            
            {/* NOVO: Seletor de Periodicidade */}
            <select
              name="periodicidade"
              className="border rounded px-3 py-2 w-full"
              defaultValue={editingPredefinedTask?.periodicidade || ""}
              required
            >
              <option value="">Selecione a periodicidade...</option>
              <option value="7d">7 dias</option>
              <option value="15d">15 dias</option>
              <option value="30d">30 dias (Mensal)</option>
              <option value="60d">60 dias (Bimestral)</option>
              <option value="90d">90 dias (Trimestral)</option>
              <option value="180d">180 dias (Semestral)</option>
              <option value="365d">365 dias (Anual)</option>
              <option value="conforme-necessidade">Conforme necessidade</option>
            </select>
            
            <Textarea name="observacao" placeholder="Observação" defaultValue={editingPredefinedTask?.observacao || ""} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingPredefinedTask(null)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-xs p-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Tem certeza que deseja excluir esta tarefa padrão?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePredefinedTask}
              className="bg-terrah-orange hover:bg-terrah-orange/90 text-white shadow font-semibold px-4 py-2 rounded"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}