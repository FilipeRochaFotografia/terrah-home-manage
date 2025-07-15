import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, User2, Calendar, CheckCircle, Clock } from "lucide-react";

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
  const [filtroTarefas, setFiltroTarefas] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  async function fetchFuncionarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from("funcionarios")
      .select("id, nome, email, telefone, cargo, ativo, user_id")
      .order("nome");
    if (!error && data) setFuncionarios(data);
    setLoading(false);
  }

  async function fetchTarefasAtribuidas(funcionario: Funcionario) {
    // Usar user_id do funcionário para buscar tarefas
    const userIdToSearch = funcionario.user_id || funcionario.id;
    
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

    if (!error && data) {
      setTarefasAtribuidas(data.map(t => ({
        ...t,
        imovel_nome: (t.imoveis as any).nome
      })));
    }
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
    const funcionarioData = {
      nome,
      email,
      telefone: telefone || null,
      cargo: cargo || null
    };
    
    if (editFuncionario) {
      await supabase.from("funcionarios").update(funcionarioData).eq("id", editFuncionario.id);
    } else {
      await supabase.from("funcionarios").insert(funcionarioData);
    }
    setSaving(false);
    closeForm();
    fetchFuncionarios();
  }

  async function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja remover este funcionário?")) {
      await supabase.from("funcionarios").delete().eq("id", id);
      fetchFuncionarios();
    }
  }

  function handleFuncionarioClick(funcionario: Funcionario) {
    if (selectedFuncionario === funcionario.id) {
      setSelectedFuncionario(null);
      setTarefasAtribuidas([]);
      setFiltroTarefas('todas');
    } else {
      setSelectedFuncionario(funcionario.id);
      setFiltroTarefas('todas');
      fetchTarefasAtribuidas(funcionario);
    }
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
        <div className="text-center py-12 text-muted-foreground">Carregando funcionários...</div>
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
                    <div className="flex gap-2">
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

              {/* Tarefas atribuídas */}
              {selectedFuncionario === funcionario.id && (
                <div className="mt-4 ml-4 space-y-4">
                  <h4 className="text-lg font-semibold text-terrah-turquoise flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Tarefas Atribuídas ({tarefasAtribuidas.length})
                  </h4>
                  
                  {tarefasAtribuidas.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma tarefa atribuída</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Botões Pendentes e Concluídas */}
                      <div className="flex gap-2">
                        <button 
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            filtroTarefas === 'todas'
                              ? 'bg-terrah-turquoise text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => setFiltroTarefas('todas')}
                        >
                          Todas ({tarefasAtribuidas.length})
                        </button>
                        <button 
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            filtroTarefas === 'pendentes'
                              ? 'bg-terrah-orange text-white'
                              : tarefasAtribuidas.filter(t => t.status === 'em_aberto').length === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-terrah-orange/10 text-terrah-orange hover:bg-terrah-orange/20'
                          }`}
                          disabled={tarefasAtribuidas.filter(t => t.status === 'em_aberto').length === 0}
                          onClick={() => setFiltroTarefas('pendentes')}
                        >
                          <Clock className="h-4 w-4 inline mr-1" />
                          {tarefasAtribuidas.filter(t => t.status === 'em_aberto').length}
                        </button>
                        <button 
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            filtroTarefas === 'concluidas'
                              ? 'bg-success text-white'
                              : tarefasAtribuidas.filter(t => t.status === 'concluida').length === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-success/10 text-success hover:bg-success/20'
                          }`}
                          disabled={tarefasAtribuidas.filter(t => t.status === 'concluida').length === 0}
                          onClick={() => setFiltroTarefas('concluidas')}
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          {tarefasAtribuidas.filter(t => t.status === 'concluida').length}
                        </button>
                      </div>

                      {/* Micro Cards das Tarefas */}
                      <div>
                        {(() => {
                          const tarefasFiltradas = tarefasAtribuidas.filter(tarefa => {
                            if (filtroTarefas === 'pendentes') return tarefa.status === 'em_aberto';
                            if (filtroTarefas === 'concluidas') return tarefa.status === 'concluida';
                            return true; // 'todas'
                          });
                          
                          if (tarefasFiltradas.length === 0) {
                            return (
                              <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-lg">
                                <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  {filtroTarefas === 'pendentes' ? 'Nenhuma tarefa pendente' : 
                                   filtroTarefas === 'concluidas' ? 'Nenhuma tarefa concluída' : 
                                   'Nenhuma tarefa encontrada'}
                                </p>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {tarefasFiltradas.map((tarefa) => (
                                <div 
                                  key={tarefa.id} 
                                  className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-all cursor-pointer border-l-2 border-l-terrah-turquoise/20 hover:border-l-terrah-turquoise"
                                  onClick={() => {
                                    // Navegar para aba de tarefas e filtrar por esta tarefa específica
                                    window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'tasks' }));
                                    setTimeout(() => {
                                      window.dispatchEvent(new CustomEvent('clearColorFilter'));
                                      window.dispatchEvent(new CustomEvent('filterTasksById', { detail: tarefa.id }));
                                    }, 100);
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{tarefa.titulo}</p>
                                      <p className="text-xs text-muted-foreground truncate">{tarefa.imovel_nome}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")}
                                      </p>
                          </div>
                                    <div className={`${getStatusColor(tarefa.status)} border-0 font-medium inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ml-2`}>
                              {getStatusLabel(tarefa.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
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
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">{editFuncionario ? "Editar Funcionário" : "Novo Funcionário"}</h3>
            <input
              className="border rounded px-3 py-2"
              placeholder="Nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              autoFocus
            />
            <input
              className="border rounded px-3 py-2"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Telefone (opcional)"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Cargo (opcional)"
              value={cargo}
              onChange={e => setCargo(e.target.value)}
            />
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