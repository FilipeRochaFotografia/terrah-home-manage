import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [exportType, setExportType] = useState<string>("");
  const [userInfo, setUserInfo] = useState<{nome: string, email: string, isAdmin: boolean} | null>(null);

  // State para notificações lidas por sessão
  const [notificacoesLidas, setNotificacoesLidas] = useState(() => {
    const saved = sessionStorage.getItem('notificacoesLidas');
    return saved ? JSON.parse(saved) : [];
  });

  // Função para buscar notificações
  const buscarNotificacoes = async () => {
    setLoading(true);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    // Buscar tarefas em aberto
    const { data: tarefas } = await supabase
      .from('tarefas')
      .select('id, titulo, data_vencimento, status')
      .eq('status', 'em_aberto');
    if (tarefas) {
      const notificacoes = tarefas.filter(tarefa => {
        const venc = new Date(tarefa.data_vencimento);
        venc.setHours(0, 0, 0, 0);
        const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diff < 0 || diff <= 5;
      }).map(tarefa => ({
        ...tarefa,
        tipo: (() => {
          const venc = new Date(tarefa.data_vencimento);
          venc.setHours(0, 0, 0, 0);
          const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          if (diff < 0) return 'Atrasada';
          if (diff === 0) return 'Urgente (hoje)';
          if (diff <= 5) return `Urgente (${diff} dias)`;
          return '';
        })()
      }));
      // Filtrar notificações já lidas
      const notificacoesFiltradas = notificacoes.filter(n => !notificacoesLidas.includes(n.id));
      setNotificacoes(notificacoesFiltradas);
    } else {
      setNotificacoes([]);
    }
    setLoading(false);
  };

  // Buscar notificações ao montar o Header
  useEffect(() => {
    buscarNotificacoes();
    window.addEventListener('tarefasAtualizadas', buscarNotificacoes);
    return () => window.removeEventListener('tarefasAtualizadas', buscarNotificacoes);
  }, []);

  // Buscar notificações ao abrir o modal
  useEffect(() => {
    if (showNotifications) {
      buscarNotificacoes();
    }
  }, [showNotifications]);

  // Buscar funcionários para o modal de equipe
  useEffect(() => {
    if (showTeamModal) {
      supabase.from("funcionarios").select("id, nome, cargo, ativo, is_admin").then(({ data }) => {
        if (data) setFuncionarios(data);
      });
    }
  }, [showTeamModal]);

  useEffect(() => {
    async function fetchUserInfo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Buscar dados extras na tabela funcionarios
        const { data: funcionarios } = await supabase
          .from('funcionarios')
          .select('nome, email, is_admin')
          .eq('user_id', user.id)
          .maybeSingle();
        setUserInfo({
          nome: funcionarios?.nome || user.user_metadata?.name || 'Usuário',
          email: funcionarios?.email || user.email,
          isAdmin: !!funcionarios?.is_admin
        });
      }
    }
    fetchUserInfo();
  }, []);

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

  const notificacoesCount = notificacoes.length;

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
            >
            <Settings className="h-5 w-5" onClick={() => setShowExportModal(true)} />
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
                    <button className="w-full text-left px-4 py-2 hover:bg-terrah-turquoise/10" onClick={() => { setShowExportModal(true); setShowProfileMenu(false); }}>Exportar relatórios</button>
                    <button className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10" onClick={handleLogout}>Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Modal de notificações */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30">
            <div className="bg-white rounded-lg shadow-xl mt-20 mr-8 w-full max-w-sm p-6 relative animate-in slide-in-from-top-4 duration-300">
              <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => { setShowNotifications(false); }}>&times;</button>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-terrah-orange" /> Notificações
              </h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : notificacoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma notificação de tarefa urgente ou atrasada.</div>
              ) : (
                <ul className="space-y-3">
                  {notificacoes.map((n) => (
                    <li
                      key={n.id}
                      className="border rounded-lg p-3 flex flex-col gap-1 bg-terrah-orange/5 cursor-pointer hover:bg-terrah-orange/10 transition"
                      onClick={() => {
                        setShowNotifications(false);
                        setNotificacoes(prev => prev.filter(notif => notif.id !== n.id));
                        setNotificacoesLidas(prev => {
                          const updated = [...prev, n.id];
                          sessionStorage.setItem('notificacoesLidas', JSON.stringify(updated));
                          return updated;
                        });
                        // Navegar para a aba de tarefas e filtrar pela tarefa
                        const event = new CustomEvent('navigateToTab', { detail: 'tasks' });
                        window.dispatchEvent(event);
                        setTimeout(() => {
                          const filterEvent = new CustomEvent('setTaskColorFilter', { detail: n.tipo.startsWith('Atrasada') ? 'atrasada' : 'urgente' });
                          window.dispatchEvent(filterEvent);
                        }, 100);
                      }}
                    >
                      <span className="font-semibold text-terrah-orange">{n.tipo}</span>
                      <span className="font-medium text-foreground">{n.titulo}</span>
                      <span className="text-xs text-muted-foreground">Vencimento: {n.data_vencimento}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1" onClick={() => setShowNotifications(false)} />
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
    </header>
  );
}