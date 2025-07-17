import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, List, History, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { NavigateToTabEvent, FilterTasksByIdEvent, FilterTasksByPropertyEvent } from "@/types/events";
import { toast } from "sonner";

interface Imovel {
  id: string;
  nome: string;
  observacao?: string;
  ativo?: boolean;
  tipo?: string; // "comercial" ou "residencial"
}

interface TarefaCompacta {
  id: string;
  titulo: string;
  data_vencimento: string;
  data_conclusao?: string;
  responsavel_id?: string;
  status: string;
}

// Funções utilitárias copiadas do FuncionariosList para colorir e rotular tarefas
function getPrioridadeColor(diasRestantes: number): string {
  if (diasRestantes < 0) return "border-l-red-500 bg-red-50"; // Atrasada
  if (diasRestantes <= 5) return "border-l-red-500 bg-red-50"; // Urgente
  if (diasRestantes <= 14) return "border-l-orange-500 bg-orange-50"; // Atenção
  if (diasRestantes <= 29) return "border-l-yellow-500 bg-yellow-50"; // Moderado
  return "border-l-green-500 bg-green-50"; // Normal
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

export function PropertyList() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editImovel, setEditImovel] = useState<Imovel | null>(null);
  const [nome, setNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [tipo, setTipo] = useState("residencial");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState<string>("ativos");
  // Substituir o estado expandedImovelId por um objeto {id, tipo} para controlar qual aba está expandida (pendentes ou historico)
  const [expandedImovel, setExpandedImovel] = useState<{id: string, tipo: 'pendentes' | 'historico'} | null>(null);
  const [tarefasPorImovel, setTarefasPorImovel] = useState<Record<string, {pendentes?: TarefaCompacta[], historico?: TarefaCompacta[]}>>({});
  const [loadingTarefas, setLoadingTarefas] = useState<{id: string, tipo: 'pendentes' | 'historico'} | null>(null);
  // Estado para controlar quantas tarefas mostrar por imóvel
  const [tarefasVisiveis, setTarefasVisiveis] = useState<Record<string, number>>({});
  // Adicionar logo após os hooks de estado:
  const statusOptions = [
    { key: 'todas', label: 'Todas' },
    { key: 'em_aberto', label: 'Em Aberto' },
    { key: 'em_andamento', label: 'Em Andamento' },
    { key: 'concluida', label: 'Concluídas' },
    { key: 'atrasadas', label: 'Atrasadas' },
  ];
  // Estado para filtro de status por imóvel/aba
  const [filtroStatus, setFiltroStatus] = useState<Record<string, string>>({});

  // Função para filtrar tarefas por status
  function filtrarTarefasStatus(tarefas: TarefaCompacta[], status: string) {
    if (!status || status === 'todas') return tarefas;
    if (status === 'atrasadas') {
      return tarefas.filter(t => {
        const dias = calcularDiasRestantes(t.data_vencimento);
        return dias < 0;
      });
    }
    return tarefas.filter(t => t.status === status);
  }

  // Função para calcular dias restantes (igual FuncionariosList)
  function calcularDiasRestantes(dataVencimento: string): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchImoveis();
  }, []);

  async function fetchImoveis() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("imoveis").select("id, nome, observacao, ativo, tipo").order("nome");
      if (error) throw error;
      if (data) setImoveis(data);
    } catch (error: any) {
      console.error("Erro ao buscar imóveis:", error);
      toast.error("Não foi possível carregar os imóveis.");
    } finally {
      setLoading(false);
    }
  }

  function openForm(imovel?: Imovel) {
    setEditImovel(imovel || null);
    setNome(imovel?.nome || "");
    setObservacao(imovel?.observacao || "");
    setTipo(imovel?.tipo || "residencial");
    setAtivo(imovel?.ativo !== undefined ? imovel.ativo : true);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditImovel(null);
    setNome("");
    setObservacao("");
    setTipo("residencial");
    setAtivo(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const imovelData = { nome, observacao, tipo, ativo };
      let error;

      if (editImovel) {
        ({ error } = await supabase.from("imoveis").update(imovelData).eq("id", editImovel.id));
      } else {
        ({ error } = await supabase.from("imoveis").insert(imovelData));
      }

      if (error) throw error;

      toast.success(`Imóvel ${editImovel ? 'atualizado' : 'criado'} com sucesso!`);
      closeForm();
      fetchImoveis();

    } catch (error: any) {
      console.error("Erro ao salvar imóvel:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    toast.warning("Tem certeza que deseja remover este imóvel?", {
      action: {
        label: "Confirmar",
        onClick: async () => {
          try {
            const { error } = await supabase.from("imoveis").delete().eq("id", id);
            if (error) throw error;
            toast.success("Imóvel removido com sucesso!");
            fetchImoveis();
          } catch (error: any) {
            console.error("Erro ao remover imóvel:", error);
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

  async function fetchTarefas(imovelId: string, tipo: 'pendentes' | 'historico') {
    setLoadingTarefas({id: imovelId, tipo});
    try {
      let query = supabase.from("tarefas").select("id, titulo, data_vencimento, data_conclusao, responsavel_id, status").eq("imovel_id", imovelId);
      if (tipo === 'pendentes') {
        query = query.eq("status", "em_aberto").order("data_vencimento", { ascending: true });
      } else {
        query = query.eq("status", "concluida").order("data_conclusao", { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        setTarefasPorImovel(prev => ({
          ...prev,
          [imovelId]: {
            ...prev[imovelId],
            [tipo]: data
          }
        }));
        setTarefasVisiveis(prev => ({
          ...prev,
          [`${imovelId}-${tipo}`]: 5
        }));
      }
    } catch (error: any) {
      console.error("Erro ao buscar tarefas do imóvel:", error);
      toast.error("Não foi possível carregar as tarefas deste imóvel.");
    } finally {
      setLoadingTarefas(null);
    }
  }

  function handleExpand(imovelId: string, tipo: 'pendentes' | 'historico') {
    if (expandedImovel && expandedImovel.id === imovelId && expandedImovel.tipo === tipo) {
      setExpandedImovel(null);
    } else {
      setExpandedImovel({id: imovelId, tipo});
      if (!tarefasPorImovel[imovelId]?.[tipo]) {
        fetchTarefas(imovelId, tipo);
      }
    }
  }

  function mostrarMaisTarefas(imovelId: string, tipo: 'pendentes' | 'historico') {
    const key = `${imovelId}-${tipo}`;
    setTarefasVisiveis(prev => ({
      ...prev,
      [key]: (prev[key] || 5) + 5
    }));
  }

  // Filtro de imóveis
  const imoveisFiltrados = imoveis.filter(imovel => {
    if (filtro === "ativos") return imovel.ativo !== false;
    if (filtro === "desativados") return imovel.ativo === false;
    if (filtro === "comercial") return imovel.tipo === "comercial";
    return true;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${filtro === "ativos" ? "bg-terrah-turquoise/10 text-terrah-turquoise border-terrah-turquoise" : "bg-muted text-muted-foreground border-muted"}`}
            onClick={() => setFiltro("ativos")}
          >Ativos</button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${filtro === "comercial" ? "bg-terrah-orange/10 text-terrah-orange border-terrah-orange" : "bg-muted text-muted-foreground border-muted"}`}
            onClick={() => setFiltro("comercial")}
          >Apenas Comercial</button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${filtro === "desativados" ? "bg-destructive/10 text-destructive border-destructive" : "bg-muted text-muted-foreground border-muted"}`}
            onClick={() => setFiltro("desativados")}
          >Desativados</button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${filtro === "todos" ? "bg-primary/10 text-primary border-primary" : "bg-muted text-muted-foreground border-muted"}`}
            onClick={() => setFiltro("todos")}
          >Todos</button>
        </div>
        {isAdmin && (
          <Button
            variant="turquoise"
            className="bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => openForm()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Imóvel
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border shadow-md bg-white p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : imoveisFiltrados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum imóvel encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imoveisFiltrados.map((imovel) => {
            const tarefasVisiveisKey = `${imovel.id}-${expandedImovel?.tipo}`;
            const tarefasVisiveisCount = tarefasVisiveis[tarefasVisiveisKey] || 5;
            const tarefasDoImovel = (expandedImovel && expandedImovel.id === imovel.id && expandedImovel.tipo)
              ? (tarefasPorImovel[imovel.id]?.[expandedImovel.tipo] || [])
              : [];
            const abaKey = `${imovel.id}-${expandedImovel?.tipo}`;
            const statusSelecionado = filtroStatus[abaKey] || 'todas';
            const tarefasFiltradas = filtrarTarefasStatus(tarefasDoImovel, statusSelecionado);
            const tarefasParaMostrar = tarefasFiltradas.slice(0, tarefasVisiveisCount);
            const temMaisTarefas = tarefasFiltradas.length > tarefasVisiveisCount;

            return (
            <div key={imovel.id} className={`group rounded-xl border shadow-md hover:shadow-xl transition-all duration-300 bg-white p-4 flex flex-col gap-2 border-l-4 ${imovel.ativo === false ? "border-destructive/60" : imovel.tipo === "comercial" ? "border-terrah-orange/60" : "border-terrah-turquoise/60"}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-lg font-bold group-hover:text-terrah-turquoise transition-colors duration-200">{imovel.nome}</span>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${imovel.ativo === false ? "bg-destructive/10 text-destructive" : "bg-terrah-turquoise/10 text-terrah-turquoise"}`}>{imovel.ativo === false ? "Desativado" : "Ativo"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${imovel.tipo === "comercial" ? "bg-terrah-orange/10 text-terrah-orange" : "bg-muted text-muted-foreground"}`}>{imovel.tipo === "comercial" ? "Comercial" : "Residencial"}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openForm(imovel)} title="Editar">
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(imovel.id)} title="Remover">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
                {imovel.observacao && (
                  <div className="text-sm text-muted-foreground mb-2">{imovel.observacao}</div>
                )}
                <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleExpand(imovel.id, 'pendentes')}>
                  <List className="h-4 w-4 mr-1" /> Tarefas Pendentes {expandedImovel?.id === imovel.id && expandedImovel.tipo === 'pendentes' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExpand(imovel.id, 'historico')}>
                  <History className="h-4 w-4 mr-1" /> Histórico {expandedImovel?.id === imovel.id && expandedImovel.tipo === 'historico' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
                  </Button>
              </div>
              {/* Lista compacta de tarefas pendentes */}
              {expandedImovel?.id === imovel.id && (
                <div className="mt-3 bg-muted/30 rounded-lg p-3">
                  {loadingTarefas && loadingTarefas.id === imovel.id && loadingTarefas.tipo === expandedImovel.tipo ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="rounded-lg p-3 bg-white animate-pulse">
                          <div className="h-4 bg-muted rounded w-5/6"></div>
                        </div>
                      ))}
                    </div>
                  ) : (tarefasDoImovel.length ? (
                    <>
                      <div className="mb-2 flex flex-wrap gap-2 items-center">
                        {statusOptions.map(opt => (
                          <Button
                            key={opt.key}
                            variant={statusSelecionado === opt.key ? 'default' : 'outline'}
                            size="sm"
                            className={statusSelecionado === opt.key ? 'bg-terrah-turquoise hover:bg-terrah-turquoise/90' : ''}
                            onClick={() => setFiltroStatus(prev => ({ ...prev, [abaKey]: opt.key }))}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                      <ul className="space-y-2">
                        {tarefasParaMostrar.map(tarefa => {
                          const diasRestantes = calcularDiasRestantes(tarefa.data_vencimento);
                          return (
                            <li key={tarefa.id}>
                              <div
                                className={`rounded-lg p-3 cursor-pointer transition-all ${getPrioridadeColor(diasRestantes)} hover:shadow-md hover:scale-[1.01] flex items-center justify-between`}
                                onClick={() => {
                                  const navEvent: NavigateToTabEvent = new CustomEvent('navigateToTab', { detail: 'tasks' });
                                  window.dispatchEvent(navEvent);
                                  setTimeout(() => {
                                    const filterEvent: FilterTasksByIdEvent = new CustomEvent('filterTasksById', { detail: tarefa.id });
                                    window.dispatchEvent(filterEvent);
                                  }, 100);
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-foreground text-sm mb-1">{tarefa.titulo}</div>
                                  <div className="text-xs text-muted-foreground">Vence em: {new Date(tarefa.data_vencimento).toLocaleDateString('pt-BR')}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPrioridadeBadgeColor(diasRestantes)}`}>{getPrioridadeLabel(diasRestantes)}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(tarefa.status)}`}>{getStatusLabel(tarefa.status)}</span>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                      
                      {/* Botão Mostrar Mais */}
                      {temMaisTarefas && expandedImovel && expandedImovel.tipo && (
                        <div className="text-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => mostrarMaisTarefas(imovel.id, expandedImovel.tipo)}
                            className="text-terrah-turquoise border-terrah-turquoise hover:bg-terrah-turquoise hover:text-white"
                          >
                            <ChevronDown className="h-4 w-4 mr-2" /> Mostrar mais ({tarefasDoImovel.length - tarefasVisiveisCount} restantes)
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-2">Nenhuma tarefa {expandedImovel.tipo === 'pendentes' ? 'pendente' : 'concluída'}.</div>
                  ))}
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      const navEvent: NavigateToTabEvent = new CustomEvent('navigateToTab', { detail: 'tasks' });
                      window.dispatchEvent(navEvent);
                      setTimeout(() => {
                        const filterEvent: FilterTasksByPropertyEvent = new CustomEvent('filterTasksByProperty', { detail: { imovelId: imovel.id, status: expandedImovel.tipo === 'pendentes' ? 'em_aberto' : 'concluida' } });
                        window.dispatchEvent(filterEvent);
                      }, 100);
                    }}>
                      Abrir em Tarefas
                  </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* Modal simples para cadastro/edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">{editImovel ? "Editar Imóvel" : "Novo Imóvel"}</h3>
            <input
              className="border rounded px-3 py-2"
              placeholder="Nome do imóvel"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              autoFocus
            />
            <textarea
              className="border rounded px-3 py-2"
              placeholder="Observação (opcional)"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <select className="border rounded px-3 py-2 flex-1" value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
              </select>
              <select className="border rounded px-3 py-2 flex-1" value={ativo ? "ativo" : "desativado"} onChange={e => setAtivo(e.target.value === "ativo")}> 
                <option value="ativo">Ativo</option>
                <option value="desativado">Desativado</option>
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}