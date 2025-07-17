import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, User2, Calendar, CheckCircle, Clock, AlertTriangle, Filter, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NavigateToTabEvent, FilterTasksByIdEvent } from "@/types/events";
import { toast } from "sonner";

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  ativo: boolean;
  user_id?: string;
}

interface TarefaAtribuida {
  id: string;
  titulo: string;
  status: string;
  data_vencimento: string;
  imovel_nome: string;
  dias_restantes?: number;
}

export function FuncionariosList() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editFuncionario, setEditFuncionario] = useState<Funcionario | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<string | null>(null);
  const [tarefasAtribuidas, setTarefasAtribuidas] = useState<TarefaAtribuida[]>([]);
  const [loadingTarefas, setLoadingTarefas] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'em_aberto' | 'em_andamento' | 'concluida' | 'atrasadas'>('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todas' | 'hoje' | 'semana' | 'mes'>('todas');
  const [tarefasVisiveis, setTarefasVisiveis] = useState(5);

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  async function fetchFuncionarios() {
    setLoading(true);
    try {
    const { data, error } = await supabase
      .from("funcionarios")
      .select("id, nome, email, telefone, cargo, ativo, user_id")
      .order("nome");
      if (error) throw error;
      if (data) setFuncionarios(data);
    } catch (error: any) {
      console.error("Erro ao buscar funcionários:", error);
      toast.error("Não foi possível carregar os funcionários.");
    } finally {
    setLoading(false);
    }
  }

  async function fetchTarefasAtribuidas(funcionario: Funcionario) {
    // Usar user_id do funcionário para buscar tarefas
    const userIdToSearch = funcionario.user_id || funcionario.id;
    setLoadingTarefas(true);
    
    try {
    const { data, error } = await supabase
      .from("tarefas")
      .select(`
        id,
        titulo,
        status,
        data_vencimento,
        imoveis!inner(nome)
      `)
      .eq("responsavel_id", userIdToSearch)
      .order("data_vencimento", { ascending: false });

      if (error) throw error;

      if (data) {
        const tarefasComDias = data.map(t => ({
        ...t,
          imovel_nome: (t.imoveis as any).nome,
          dias_restantes: calcularDiasRestantes(t.data_vencimento)
        }));
        setTarefasAtribuidas(tarefasComDias);
        setTarefasVisiveis(5); // Reset para 5 ao trocar de funcionário
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas do funcionário:", error);
      toast.error("Não foi possível carregar as tarefas deste funcionário.");
    } finally {
      setLoadingTarefas(false);
    }
  }

  function calcularDiasRestantes(dataVencimento: string): number {
    const hoje = new Date();
    // Zerar hora para comparar apenas datas
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getPrioridadeColor(diasRestantes: number): string {
    if (diasRestantes < 0) return "border-l-red-500 bg-red-50"; // Atrasada
    if (diasRestantes <= 5) return "border-l-red-500 bg-red-50"; // Urgente
    if (diasRestantes <= 14) return "border-l-orange-500 bg-orange-50"; // Atenção
    if (diasRestantes <= 29) return "border-l-yellow-500 bg-yellow-50"; // Moderado
    return "border-l-green-500 bg-green-50"; // Normal (apenas > 29 dias)
  }

  function getPrioridadeLabel(diasRestantes: number): string {
    if (diasRestantes < 0) return "Urgente";
    if (diasRestantes === 0) return "Hoje";
    if (diasRestantes === 1) return "Amanhã";
    if (diasRestantes <= 5) return "Próximos dias";
    if (diasRestantes <= 14) return "Atenção";
    if (diasRestantes <= 29) return "Moderado";
    return "Normal";
  }

  function getPrioridadeBadgeColor(diasRestantes: number): string {
    if (diasRestantes < 0) return "bg-red-100 text-red-800 border-red-200";
    if (diasRestantes <= 5) return "bg-red-100 text-red-800 border-red-200";
    if (diasRestantes <= 14) return "bg-orange-100 text-orange-800 border-orange-200";
    if (diasRestantes <= 29) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  }

  function filtrarTarefas() {
    let tarefasFiltradas = tarefasAtribuidas;

    // Filtro por status
    if (filtroStatus !== 'todas') {
      if (filtroStatus === 'atrasadas') {
        tarefasFiltradas = tarefasFiltradas.filter(t => t.dias_restantes && t.dias_restantes < 0);
      } else {
        tarefasFiltradas = tarefasFiltradas.filter(t => t.status === filtroStatus);
      }
    }

    // Filtro por período
    if (filtroPeriodo !== 'todas') {
      const hoje = new Date();
      const fimSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      switch (filtroPeriodo) {
        case 'hoje':
          tarefasFiltradas = tarefasFiltradas.filter(t => {
            const vencimento = new Date(t.data_vencimento);
            return vencimento.toDateString() === hoje.toDateString();
          });
          break;
        case 'semana':
          tarefasFiltradas = tarefasFiltradas.filter(t => {
            const vencimento = new Date(t.data_vencimento);
            return vencimento <= fimSemana && vencimento >= hoje;
          });
          break;
        case 'mes':
          tarefasFiltradas = tarefasFiltradas.filter(t => {
            const vencimento = new Date(t.data_vencimento);
            return vencimento <= fimMes && vencimento >= hoje;
          });
          break;
      }
    }

    // Ordenar da mais atrasada para a menos atrasada
    tarefasFiltradas = tarefasFiltradas.slice().sort((a, b) => (a.dias_restantes ?? 9999) - (b.dias_restantes ?? 9999));

    return tarefasFiltradas;
  }

  const tarefasFiltradas = filtrarTarefas();
  const tarefasParaMostrar = tarefasFiltradas.slice(0, tarefasVisiveis);
  const temMaisTarefas = tarefasFiltradas.length > tarefasVisiveis;

  function mostrarMaisTarefas() {
    setTarefasVisiveis(prev => prev + 5);
  }

  function openForm(funcionario?: Funcionario) {
    setEditFuncionario(funcionario || null);
    setNome(funcionario?.nome || "");
    setEmail(funcionario?.email || "");
    setTelefone(funcionario?.telefone || "");
    setCargo(funcionario?.cargo || "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditFuncionario(null);
    setNome("");
    setEmail("");
    setTelefone("");
    setCargo("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
    const funcionarioData = {
      nome,
      email,
      telefone: telefone || null,
      cargo: cargo || null
    };
    
      let error;
    if (editFuncionario) {
        ({ error } = await supabase.from("funcionarios").update(funcionarioData).eq("id", editFuncionario.id));
    } else {
        ({ error } = await supabase.from("funcionarios").insert(funcionarioData));
    }
      
      if (error) throw error;
      
      toast.success(`Funcionário ${editFuncionario ? 'atualizado' : 'criado'} com sucesso!`);
    closeForm();
    fetchFuncionarios();
      
    } catch (error: any) {
      console.error("Erro ao salvar funcionário:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    // Usando toast para confirmação em vez de window.confirm
    toast.warning("Tem certeza que deseja remover este funcionário?", {
      action: {
        label: "Confirmar",
        onClick: async () => {
          try {
            const { error } = await supabase.from("funcionarios").delete().eq("id", id);
            if (error) throw error;
            toast.success("Funcionário removido com sucesso!");
      fetchFuncionarios();
          } catch (error: any) {
            console.error("Erro ao remover funcionário:", error);
            toast.error(`Erro ao remover: ${error.message}`);
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
      duration: 5000,
    });
  }

  function handleFuncionarioClick(funcionario: Funcionario) {
    if (selectedFuncionario === funcionario.id) {
      setSelectedFuncionario(null);
      setTarefasAtribuidas([]);
      setFiltroStatus('todas');
      setFiltroPeriodo('todas');
    } else {
      setSelectedFuncionario(funcionario.id);
      setFiltroStatus('todas');
      setFiltroPeriodo('todas');
      fetchTarefasAtribuidas(funcionario);
    }
  }

  function handleTarefaClick(tarefaId: string) {
    // Primeiro navegar para a aba de tarefas
    const navEvent: NavigateToTabEvent = new CustomEvent('navigateToTab', { detail: 'tasks' });
    window.dispatchEvent(navEvent);
    // Depois de um pequeno delay, disparar o filtro para a tarefa específica
    setTimeout(() => {
      const filterEvent: FilterTasksByIdEvent = new CustomEvent('filterTasksById', { detail: tarefaId });
      window.dispatchEvent(filterEvent);
    }, 100);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "em_aberto":
        return "bg-muted text-muted-foreground";
      case "em_andamento":
        return "bg-terrah-turquoise/20 text-terrah-turquoise";
      case "concluida":
        return "bg-success/20 text-success";
      case "pausada":
        return "bg-warning/20 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "em_aberto":
        return "Em Aberto";
      case "em_andamento":
        return "Em Andamento";
      case "concluida":
        return "Concluída";
      case "pausada":
        return "Pausada";
      default:
        return "Em Aberto";
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Funcionários
        </h2>
        {isAdmin && (
          <Button
            variant="turquoise"
            className="bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => openForm()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {funcionarios.map((funcionario) => (
            <div key={funcionario.id}>
              <Card 
                className={`group hover:shadow-lg transition-all duration-300 border-l-4 border-l-terrah-turquoise/20 hover:border-l-terrah-turquoise cursor-pointer ${
                  selectedFuncionario === funcionario.id ? 'ring-2 ring-terrah-turquoise/30' : ''
                }`}
                onClick={() => handleFuncionarioClick(funcionario)}
              >
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terrah-turquoise/20 rounded-full flex items-center justify-center">
                      <User2 className="h-5 w-5 text-terrah-turquoise" />
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-terrah-turquoise transition-colors duration-200">
                        {funcionario.nome}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{funcionario.cargo || "Sem cargo definido"}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openForm(funcionario); }} title="Editar">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(funcionario.id); }} title="Remover">
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    {funcionario.email}
                    {funcionario.telefone && ` • ${funcionario.telefone}`}
                  </div>
                </CardContent>
              </Card>

              {/* Tarefas Atribuídas */}
              {selectedFuncionario === funcionario.id && (
                <div className="ml-6 mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-terrah-turquoise" />
                    <h4 className="font-semibold text-terrah-turquoise flex items-center gap-2">
                    Tarefas Atribuídas ({tarefasAtribuidas.length})
                  </h4>
                  </div>

                  {loadingTarefas ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <Card key={i} className="p-4 bg-muted/30 animate-pulse">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded w-40"></div>
                              <div className="h-3 bg-muted rounded w-24"></div>
                            </div>
                            <div className="h-6 w-16 bg-muted rounded-full"></div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Filtros */}
                      <div className="space-y-3">
                        {/* Filtro por Status */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Filter className="h-4 w-4" />
                          </span>
                          {[
                            { key: 'todas', label: 'Todas', count: tarefasAtribuidas.length },
                            { key: 'em_aberto', label: 'Em Aberto', count: tarefasAtribuidas.filter(t => t.status === 'em_aberto').length },
                            { key: 'em_andamento', label: 'Em Andamento', count: tarefasAtribuidas.filter(t => t.status === 'em_andamento').length },
                            { key: 'concluida', label: 'Concluídas', count: tarefasAtribuidas.filter(t => t.status === 'concluida').length },
                            { key: 'atrasadas', label: 'Atrasadas', count: tarefasAtribuidas.filter(t => t.dias_restantes && t.dias_restantes < 0).length }
                          ].map(({ key, label, count }) => (
                            <Button
                              key={key}
                              variant={filtroStatus === key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFiltroStatus(key as any)}
                              className={filtroStatus === key ? "bg-terrah-turquoise hover:bg-terrah-turquoise/90" : ""}
                            >
                              {label} ({count})
                            </Button>
                          ))}
                        </div>

                        {/* Filtro por Período */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Período:</span>
                          {[
                            { key: 'todas', label: 'Todas' },
                            { key: 'hoje', label: 'Hoje' },
                            { key: 'semana', label: 'Esta Semana' },
                            { key: 'mes', label: 'Este Mês' }
                          ].map(({ key, label }) => (
                            <Button
                              key={key}
                              variant={filtroPeriodo === key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFiltroPeriodo(key as any)}
                              className={filtroPeriodo === key ? "bg-terrah-turquoise hover:bg-terrah-turquoise/90" : ""}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Lista de Tarefas */}
                      <div className="space-y-2">
                        {tarefasFiltradas.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma tarefa encontrada com os filtros selecionados.</p>
                              </div>
                        ) : (
                          <>
                            {tarefasParaMostrar.map((tarefa) => (
                              <Card
                                  key={tarefa.id} 
                                className={`${getPrioridadeColor(tarefa.dias_restantes || 0)} hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]`}
                                onClick={() => handleTarefaClick(tarefa.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-base leading-tight mb-1 break-words text-foreground">
                                        {tarefa.titulo}
                                      </h5>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        {tarefa.imovel_nome}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Vence em: {new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")}
                                      </p>
                          </div>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                      <Badge className={getPrioridadeBadgeColor(tarefa.dias_restantes || 0)}>
                                        {getPrioridadeLabel(tarefa.dias_restantes || 0)}
                                        {typeof tarefa.dias_restantes === 'number' && ` (${tarefa.dias_restantes} dias)`}
                                      </Badge>
                                      <Badge className={getStatusColor(tarefa.status)}>
                              {getStatusLabel(tarefa.status)}
                                      </Badge>
                            </div>
                          </div>
                                </CardContent>
                              </Card>
                            ))}
                            
                            {/* Botão Mostrar Mais */}
                            {temMaisTarefas && (
                              <div className="text-center pt-2">
                                <Button
                                  variant="outline"
                                  onClick={mostrarMaisTarefas}
                                  className="text-terrah-turquoise border-terrah-turquoise hover:bg-terrah-turquoise hover:text-white"
                                >
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  Mostrar mais ({tarefasFiltradas.length - tarefasVisiveis} restantes)
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                        </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para cadastro/edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-sm sm:max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">{editFuncionario ? "Editar Funcionário" : "Novo Funcionário"}</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
            <input
                className="border rounded px-3 py-2 w-full"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
            <input
                className="border rounded px-3 py-2 w-full"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
            <input
                className="border rounded px-3 py-2 w-full"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
            />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo</label>
            <input
                className="border rounded px-3 py-2 w-full"
              value={cargo}
              onChange={e => setCargo(e.target.value)}
            />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 