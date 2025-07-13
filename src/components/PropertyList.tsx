import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, List, History, ChevronDown, ChevronUp } from "lucide-react";

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

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchImoveis();
  }, []);

  async function fetchImoveis() {
    setLoading(true);
    const { data, error } = await supabase.from("imoveis").select("id, nome, observacao, ativo, tipo").order("nome");
    if (!error && data) setImoveis(data);
    setLoading(false);
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
    const imovelData = { nome, observacao, tipo, ativo };
    if (editImovel) {
      await supabase.from("imoveis").update(imovelData).eq("id", editImovel.id);
    } else {
      await supabase.from("imoveis").insert(imovelData);
    }
    setSaving(false);
    closeForm();
    fetchImoveis();
  }

  async function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja remover este imóvel?")) {
      await supabase.from("imoveis").delete().eq("id", id);
      fetchImoveis();
    }
  }

  async function fetchTarefas(imovelId: string, tipo: 'pendentes' | 'historico') {
    setLoadingTarefas({id: imovelId, tipo});
    let query = supabase.from("tarefas").select("id, titulo, data_vencimento, data_conclusao, responsavel_id, status").eq("imovel_id", imovelId);
    if (tipo === 'pendentes') {
      query = query.eq("status", "em_aberto").order("data_vencimento", { ascending: true });
    } else {
      query = query.eq("status", "concluida").order("data_conclusao", { ascending: false });
    }
    const { data, error } = await query;
    if (!error && data) {
      setTarefasPorImovel(prev => ({
        ...prev,
        [imovelId]: {
          ...prev[imovelId],
          [tipo]: data
        }
      }));
    }
    setLoadingTarefas(null);
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
        <div className="text-center py-12 text-muted-foreground">Carregando imóveis...</div>
      ) : imoveisFiltrados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum imóvel encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imoveisFiltrados.map((imovel) => (
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
                    <div className="text-center text-muted-foreground text-sm py-2">Carregando tarefas...</div>
                  ) : (tarefasPorImovel[imovel.id]?.[expandedImovel.tipo]?.length ? (
                    <ul className="divide-y divide-border/40">
                      {tarefasPorImovel[imovel.id][expandedImovel.tipo]!.map(tarefa => (
                        <li key={tarefa.id} className="py-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground truncate max-w-[60%]">{tarefa.titulo}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {expandedImovel.tipo === 'pendentes'
                              ? new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")
                              : tarefa.data_conclusao ? new Date(tarefa.data_conclusao).toLocaleDateString("pt-BR") : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-2">Nenhuma tarefa {expandedImovel.tipo === 'pendentes' ? 'pendente' : 'concluída'}.</div>
                  ))}
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'tasks' }));
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('filterTasksByProperty', { detail: { imovelId: imovel.id, status: expandedImovel.tipo === 'pendentes' ? 'em_aberto' : 'concluida' } }));
                      }, 100);
                    }}>
                      Abrir em Tarefas
                  </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
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
              <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}