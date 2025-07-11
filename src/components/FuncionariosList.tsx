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

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  async function fetchFuncionarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*")
      .order("nome");
    if (!error && data) setFuncionarios(data);
    setLoading(false);
  }

  async function fetchTarefasAtribuidas(funcionarioId: string) {
    const { data, error } = await supabase
      .from("tarefas")
      .select(`
        id,
        titulo,
        status,
        data_vencimento,
        imoveis!inner(nome)
      `)
      .eq("responsavel_id", funcionarioId)
      .order("data_vencimento", { ascending: false });

    if (!error && data) {
      setTarefasAtribuidas(data.map(t => ({
        ...t,
        imovel_nome: t.imoveis.nome
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

  function handleFuncionarioClick(funcionarioId: string) {
    if (selectedFuncionario === funcionarioId) {
      setSelectedFuncionario(null);
      setTarefasAtribuidas([]);
    } else {
      setSelectedFuncionario(funcionarioId);
      fetchTarefasAtribuidas(funcionarioId);
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
                onClick={() => handleFuncionarioClick(funcionario.id)}
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
                <div className="mt-4 ml-4 space-y-3">
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
                    <div className="space-y-2">
                      {tarefasAtribuidas.map((tarefa) => (
                        <div key={tarefa.id} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{tarefa.titulo}</p>
                            <p className="text-xs text-muted-foreground">{tarefa.imovel_nome}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`${getStatusColor(tarefa.status)} border font-medium inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`}>
                              {getStatusLabel(tarefa.status)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      ))}
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