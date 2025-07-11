import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./TaskCard";
import { Plus, Edit, Trash2, Calendar, User2, FileText } from "lucide-react";

interface TarefaPredefinida {
  id: string;
  titulo: string;
  descricao: string;
  periodicidade: string;
  observacao?: string;
}

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  ativo?: boolean;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  data_vencimento: string;
  imovel_id: string;
  tipo_manutencao: string;
  observacoes?: string;
  responsavel_id?: string;
  agendamento_data?: string;
  anotacoes?: string;
  tarefa_predefinida_id?: string;
  aguardando_aprovacao_exclusao?: boolean;
}

export function TaskList() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tarefasPredefinidas, setTarefasPredefinidas] = useState<TarefaPredefinida[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarefa, setEditTarefa] = useState<Tarefa | null>(null);
  const [selectedTarefaPredefinida, setSelectedTarefaPredefinida] = useState<TarefaPredefinida | null>(null);
  const [agendamentoData, setAgendamentoData] = useState("");
  const [anotacoes, setAnotacoes] = useState("");
  const [imovelId, setImovelId] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [imoveis, setImoveis] = useState<{id: string, nome: string}[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [saving, setSaving] = useState(false);

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchTarefas();
    fetchTarefasPredefinidas();
    fetchImoveis();
    fetchFuncionarios();
  }, []);

  async function fetchTarefas() {
    setLoading(true);
    const { data, error } = await supabase.from("tarefas").select("id, titulo, descricao, status, prioridade, data_vencimento, imovel_id, tipo_manutencao, observacoes, responsavel_id, agendamento_data, anotacoes, tarefa_predefinida_id, aguardando_aprovacao_exclusao").order("data_vencimento", { ascending: false });
    if (!error && data) setTarefas(data);
    setLoading(false);
  }

  async function fetchTarefasPredefinidas() {
    const { data, error } = await supabase
      .from("tarefas_predefinidas")
      .select("id, titulo, descricao, periodicidade, observacao")
      .order("titulo");
    if (!error && data) setTarefasPredefinidas(data);
  }

  async function fetchImoveis() {
    const { data } = await supabase.from("imoveis").select("id, nome").order("nome");
    if (data) setImoveis(data);
  }

  async function fetchFuncionarios() {
    const { data } = await supabase.from("funcionarios").select("id, nome, email, cargo").eq("ativo", true).order("nome");
    if (data) setFuncionarios(data);
  }

  function openForm(tarefa?: Tarefa) {
    setEditTarefa(tarefa || null);
    setSelectedTarefaPredefinida(null);
    setAgendamentoData(tarefa?.agendamento_data || "");
    setAnotacoes(tarefa?.anotacoes || "");
    setImovelId(tarefa?.imovel_id || "");
    setResponsavelId(tarefa?.responsavel_id || "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditTarefa(null);
    setSelectedTarefaPredefinida(null);
    setAgendamentoData("");
    setAnotacoes("");
    setImovelId("");
    setResponsavelId("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTarefaPredefinida) {
      alert("Selecione uma tarefa predefinida");
      return;
    }
    if (!imovelId) {
      alert("Selecione um imóvel");
      return;
    }
    if (!agendamentoData) {
      alert("Selecione uma data de agendamento");
      return;
    }

    setSaving(true);
    const tarefaData = {
      titulo: selectedTarefaPredefinida.titulo,
      descricao: selectedTarefaPredefinida.descricao,
      prioridade: "medium",
      data_vencimento: agendamentoData,
      tipo_manutencao: selectedTarefaPredefinida.tipo_manutencao,
      imovel_id: imovelId,
      responsavel_id: responsavelId || null,
      agendamento_data: agendamentoData,
      anotacoes: anotacoes || null,
      tarefa_predefinida_id: selectedTarefaPredefinida.id,
      status: editTarefa?.status || "em_aberto"
    };
    
    if (editTarefa) {
      await supabase.from("tarefas").update(tarefaData).eq("id", editTarefa.id);
    } else {
      await supabase.from("tarefas").insert(tarefaData);
    }
    setSaving(false);
    closeForm();
    fetchTarefas();
  }

  async function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja remover esta tarefa?")) {
      await supabase.from("tarefas").delete().eq("id", id);
      fetchTarefas();
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Tarefas
        </h2>
        {isAdmin && (
          <Button
            variant="turquoise"
            className="bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => openForm()}
          >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando tarefas...</div>
      ) : (
        <div className="space-y-4">
          {tarefas.map((tarefa) => (
            <div key={tarefa.id} className="animate-in slide-in-from-bottom-4 duration-500">
              <TaskCard
                id={tarefa.id}
                title={tarefa.titulo}
                description={tarefa.descricao}
                status={tarefa.status as any}
                priority={tarefa.prioridade as any}
                dueDate={tarefa.data_vencimento}
                property={imoveis.find(i => i.id === tarefa.imovel_id)?.nome || ""}
                assignee={"-"}
                photosCount={0}
                maintenanceType={tarefa.tipo_manutencao}
                responsavel={funcionarios.find(f => f.id === tarefa.responsavel_id)?.nome}
                anotacoes={tarefa.anotacoes}
              />
              {isAdmin && (
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="icon" onClick={() => openForm(tarefa)} title="Editar">
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tarefa.id)} title="Remover">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
        ))}
      </div>
      )}

      {/* Modal para cadastro/edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">{editTarefa ? "Editar Tarefa" : "Nova Tarefa"}</h3>
            
            {/* Seletor de Tarefa Predefinida */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Tarefa</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={selectedTarefaPredefinida?.id || ""}
                onChange={e => {
                  const tarefa = tarefasPredefinidas.find(t => t.id === e.target.value);
                  setSelectedTarefaPredefinida(tarefa || null);
                }}
                required
              >
                <option value="">Selecione uma tarefa...</option>
                {tarefasPredefinidas.map(tarefa => (
                  <option key={tarefa.id} value={tarefa.id}>
                    {tarefa.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Informações da Tarefa Selecionada */}
            {selectedTarefaPredefinida && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-terrah-turquoise" />
                  <span className="font-medium">Periodicidade: {selectedTarefaPredefinida.periodicidade}</span>
                </div>
              </div>
            )}

            {/* Data de Agendamento */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendar Data
              </label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="date"
                value={agendamentoData}
                onChange={e => setAgendamentoData(e.target.value)}
                required
              />
            </div>

            {/* Anotações */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Anotações
              </label>
              <textarea
                className="border rounded px-3 py-2 w-full"
                placeholder="Observações adicionais..."
                value={anotacoes}
                onChange={e => setAnotacoes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Selecionar Imóvel */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Imóvel</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={imovelId}
                onChange={e => setImovelId(e.target.value)}
                required
              >
                <option value="">Selecione um imóvel...</option>
                {imoveis.map(imovel => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Atribuir Responsável (apenas para admin) */}
            {isAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User2 className="h-4 w-4" />
                  Atribuir Responsável
                </label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={responsavelId}
                  onChange={e => setResponsavelId(e.target.value)}
                >
                  <option value="">Sem responsável</option>
                  {funcionarios.map(funcionario => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome} - {funcionario.cargo || "Sem cargo"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}