import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "./TaskCard";
import { Plus, Edit, Trash2, Calendar, User2, FileText, Filter, Search, RefreshCw, Clock, AlertTriangle, CheckCircle, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useRef } from 'react';

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
  user_id?: string; // Adicionado para identificar o usuário
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  data_criacao: string;
  data_vencimento: string;
  data_conclusao?: string;
  imovel_id: string;
  anotacoes?: string;
  responsavel_id?: string;
  tarefa_predefinida_id?: string;
  aguardando_aprovacao_exclusao?: boolean;
  created_at?: string;
  fotos?: string[] | null; // Adicionado para armazenar URLs das fotos
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
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const { toast } = useToast();
  const [showStartModal, setShowStartModal] = useState(false);
  const [startTarefa, setStartTarefa] = useState<Tarefa | null>(null);
  const [conclusaoData, setConclusaoData] = useState("");
  const [conclusaoResponsavel, setConclusaoResponsavel] = useState("");
  const [conclusaoAnotacoes, setConclusaoAnotacoes] = useState("");
  const [conclusaoFotos, setConclusaoFotos] = useState<File[]>([]);
  const [propertyFilter, setPropertyFilter] = useState<{imovelId: string, status: string} | null>(null);
  const [editFotos, setEditFotos] = useState<string[]>([]); // URLs das fotos já anexadas
  const [editNovasFotos, setEditNovasFotos] = useState<File[]>([]); // Novos arquivos a anexar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskIdFilter, setTaskIdFilter] = useState<string | null>(null);

  // Simulação de permissão de admin (troque por lógica real depois)
  const isAdmin = true;

  useEffect(() => {
    fetchTarefas();
    fetchTarefasPredefinidas();
    fetchImoveis();
    fetchFuncionarios();

    // Listener para abrir modal de nova tarefa
    const handleOpenTaskModal = () => {
      openForm();
    };

    window.addEventListener('openTaskModal', handleOpenTaskModal);

    // Listener para filtro de cor vindo do Dashboard
    const handleSetTaskColorFilter = (e: any) => {
      if (e.detail) setColorFilter(e.detail);
    };
    window.addEventListener('setTaskColorFilter', handleSetTaskColorFilter);

    // Listener para filtro por imóvel vindo da PropertyList
    const handleFilterTasksByProperty = (e: any) => {
      if (e.detail) setPropertyFilter(e.detail);
    };
    window.addEventListener('filterTasksByProperty', handleFilterTasksByProperty);

    // Listener para filtro por ID vindo do Dashboard
    const handleFilterTasksById = (e: any) => {
      if (e.detail) {
        console.log('[TaskList] Evento filterTasksById recebido:', e.detail);
        setTaskIdFilter(e.detail);
        setSearchTerm('');
        setStatusFilter('all');
        setColorFilter('all');
      }
    };
    window.addEventListener('filterTasksById', handleFilterTasksById);

    // Listener para limpar filtro por ID
    const handleClearTaskIdFilter = () => {
      console.log('[TaskList] Evento clearTaskIdFilter recebido');
      setTaskIdFilter(null);
    };
    window.addEventListener('clearTaskIdFilter', handleClearTaskIdFilter);

    // Listener para limpar filtro de cor
    const handleClearColorFilter = () => {
      console.log('[TaskList] Evento clearColorFilter recebido');
      setColorFilter('all');
    };
    window.addEventListener('clearColorFilter', handleClearColorFilter);

    return () => {
      window.removeEventListener('openTaskModal', handleOpenTaskModal);
      window.removeEventListener('setTaskColorFilter', handleSetTaskColorFilter);
      window.removeEventListener('filterTasksByProperty', handleFilterTasksByProperty);
      window.removeEventListener('filterTasksById', handleFilterTasksById);
      window.removeEventListener('clearTaskIdFilter', handleClearTaskIdFilter);
      window.removeEventListener('clearColorFilter', handleClearColorFilter);
    };
  }, []);

  function calcularDiasRestantes(dataVencimento: string): number {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // 1. Ajustar cor da borda do card de tarefa concluída
  function getStatusCor(diasRestantes: number, status: string): string {
    if (status === 'concluida') return 'text-terrah-turquoise bg-terrah-turquoise/10 border-l-4 border-terrah-turquoise';
    if (diasRestantes <= 5) return 'text-destructive bg-destructive/10 border-l-4 border-destructive';
    if (diasRestantes <= 14) return 'text-terrah-orange bg-terrah-orange/10 border-l-4 border-terrah-orange';
    if (diasRestantes <= 29) return 'text-yellow-600 bg-yellow-100 border-l-4 border-yellow-600';
    return 'text-green-600 bg-green-100 border-l-4 border-green-600';
  }

  function getStatusLabel(diasRestantes: number): string {
    if (diasRestantes < 0) return 'Urgente';
    if (diasRestantes === 0) return 'Hoje';
    if (diasRestantes === 1) return 'Amanhã';
    if (diasRestantes <= 5) return 'Próximos dias';
    if (diasRestantes <= 14) return 'Atenção';
    if (diasRestantes <= 29) return 'Moderado';
    return 'Normal';
  }

  function getPriorityColor(diasRestantes: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (diasRestantes <= 5) return 'destructive';
    if (diasRestantes <= 14) return 'secondary';
    if (diasRestantes <= 29) return 'outline';
    return 'default';
  }

  function getBorderColor(diasRestantes: number): string {
    if (diasRestantes <= 5) return 'red';
    if (diasRestantes <= 14) return 'orange';
    if (diasRestantes <= 29) return 'yellow';
    return 'green';
  }

  async function fetchTarefas() {
    setLoading(true);
    const { data, error } = await supabase.from("tarefas").select("id, titulo, descricao, status, data_criacao, data_vencimento, imovel_id, anotacoes, responsavel_id, tarefa_predefinida_id, aguardando_aprovacao_exclusao, created_at, data_conclusao, fotos").order("data_vencimento", { ascending: false });
    if (!error && data) setTarefas(data);
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchTarefas();
    setRefreshing(false);
  }

  async function fetchTarefasPredefinidas() {
    const { data, error } = await supabase
      .from("tarefas_predefinidas")
      .select("id, titulo, descricao, periodicidade, observacao");
    if (!error && data) setTarefasPredefinidas(data);
  }

  async function fetchImoveis() {
    const { data } = await supabase.from("imoveis").select("id, nome").order("nome");
    if (data) setImoveis(data);
  }

  async function fetchFuncionarios() {
    const { data } = await supabase.from("funcionarios").select("id, nome, email, cargo, user_id").eq("ativo", true).order("nome");
    if (data) setFuncionarios(data);
  }

  function openForm(tarefa?: Tarefa) {
    setSaving(false); // Garante que o botão Salvar não fique travado ao abrir o modal
    setEditTarefa(tarefa || null);
    // Preencher campos do formulário com os dados da tarefa selecionada
    if (tarefa) {
      const tarefaPredef = tarefasPredefinidas.find(t => t.id === tarefa.tarefa_predefinida_id) || null;
      setSelectedTarefaPredefinida(tarefaPredef);
      setAgendamentoData(tarefa.data_vencimento || "");
      setAnotacoes(tarefa.anotacoes || "");
      setImovelId(tarefa.imovel_id || "");
      setResponsavelId(tarefa.responsavel_id || "");
      setEditFotos(tarefa.fotos ?? []);
      setEditNovasFotos([]);
    } else {
    setSelectedTarefaPredefinida(null);
    setAgendamentoData("");
      setAnotacoes("");
      setImovelId("");
      setResponsavelId("");
      setEditFotos([]);
      setEditNovasFotos([]);
    }
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
    let fotosUrls = [...editFotos];
    if (editNovasFotos.length > 0) {
      for (const file of editNovasFotos) {
        const ext = file.name.split('.').pop();
        const filePath = `${editTarefa.id}/${uuidv4()}.${ext}`;
        const { data, error } = await supabase.storage.from('fotosapp').upload(filePath, file, { upsert: true });
        if (error) {
          console.error('Erro ao fazer upload:', error);
          alert('Erro ao fazer upload: ' + JSON.stringify(error));
        } else {
          const { data: publicUrlData } = supabase.storage.from('fotosapp').getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) fotosUrls.push(publicUrlData.publicUrl);
        }
      }
    }
    const tarefaData = {
      titulo: selectedTarefaPredefinida.titulo,
      descricao: selectedTarefaPredefinida.descricao,
      data_vencimento: agendamentoData,
      imovel_id: imovelId,
      responsavel_id: responsavelId || null, // user_id do funcionário
      anotacoes: anotacoes || null,
      tarefa_predefinida_id: selectedTarefaPredefinida.id,
      status: editTarefa?.status || "em_aberto",
      data_criacao: new Date().toISOString().slice(0, 10),
      fotos: fotosUrls // sempre array, mesmo vazio
    };
    
    if (editTarefa) {
      await supabase.from("tarefas").update(tarefaData).eq("id", editTarefa.id);
    } else {
      // 1. Cria a tarefa sem fotos
      const { data: insertData, error: insertError } = await supabase.from("tarefas").insert({
        titulo: selectedTarefaPredefinida.titulo,
        descricao: selectedTarefaPredefinida.descricao,
        data_vencimento: agendamentoData,
        imovel_id: imovelId,
        responsavel_id: responsavelId || null,
        anotacoes: anotacoes || null,
        tarefa_predefinida_id: selectedTarefaPredefinida.id,
        status: "em_aberto",
        data_criacao: new Date().toISOString().slice(0, 10),
        fotos: []
      }).select().single();
      if (insertError) {
        console.error("Erro ao inserir tarefa:", insertError);
        alert("Erro ao cadastrar tarefa: " + insertError.message);
        setSaving(false);
        return;
      }
      const newId = insertData?.id;
      if (!newId) {
        alert("Erro ao cadastrar tarefa: ID não retornado pelo Supabase.");
        setSaving(false);
        return;
      }
      let fotosUrls: string[] = [];
      if (editNovasFotos.length > 0 && newId) {
        for (const file of editNovasFotos) {
          const ext = file.name.split('.').pop();
          const filePath = `${newId}/${uuidv4()}.${ext}`;
          const { data, error } = await supabase.storage.from('fotosapp').upload(filePath, file, { upsert: true });
      if (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload: ' + JSON.stringify(error));
          } else {
            const { data: publicUrlData } = supabase.storage.from('fotosapp').getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) fotosUrls.push(publicUrlData.publicUrl);
          }
        }
        // 4. Atualiza a tarefa com as URLs das fotos
        await supabase.from("tarefas").update({ fotos: fotosUrls }).eq("id", newId);
      }
    }
    setSaving(false);
    closeForm();
    fetchTarefas();
    window.dispatchEvent(new Event('tarefasAtualizadas'));
  }

  async function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja remover esta tarefa?")) {
      await supabase.from("tarefas").delete().eq("id", id);
      fetchTarefas();
      window.dispatchEvent(new Event('tarefasAtualizadas'));
    }
  }

  const stats = {
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.status === 'em_aberto').length,
    concluidas: tarefas.filter(t => t.status === 'concluida').length,
    urgentes: tarefas.filter(t => calcularDiasRestantes(t.data_vencimento) <= 5 && t.status === 'em_aberto').length,
  };

  const filteredTarefas = tarefas.filter(tarefa => {
    if (taskIdFilter) return tarefa.id === taskIdFilter;
    if (propertyFilter) {
      if (tarefa.imovel_id !== propertyFilter.imovelId) return false;
      if (propertyFilter.status && tarefa.status !== propertyFilter.status) return false;
    }
    const diasRestantes = calcularDiasRestantes(tarefa.data_vencimento);
    const statusCor = getStatusCor(diasRestantes, tarefa.status);
    const statusLabel = getStatusLabel(diasRestantes);
    const priorityColor = getPriorityColor(diasRestantes);

    const matchesSearchTerm = tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               tarefa.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter = statusFilter === 'all' || tarefa.status === statusFilter;

    // Novo filtro de cor por label
    let matchesColorFilter = colorFilter === 'all';
    if (!matchesColorFilter) {
      if (colorFilter === 'urgentesEatrasadas' && tarefa.status === 'em_aberto' && (diasRestantes <= 5)) matchesColorFilter = true;
      if (colorFilter === 'atrasada' && diasRestantes < 0 && tarefa.status === 'em_aberto') matchesColorFilter = true;
      if (colorFilter === 'urgente' && diasRestantes <= 5 && diasRestantes >= 0 && tarefa.status === 'em_aberto') matchesColorFilter = true;
      if (colorFilter === 'atencao' && diasRestantes >= 1 && diasRestantes <= 5 && tarefa.status === 'em_aberto') matchesColorFilter = true;
      if (colorFilter === 'moderado' && diasRestantes >= 6 && diasRestantes <= 14 && tarefa.status === 'em_aberto') matchesColorFilter = true;
      if (colorFilter === 'normal' && diasRestantes >= 15 && tarefa.status === 'em_aberto') matchesColorFilter = true;
    }

    return matchesSearchTerm && matchesStatusFilter && matchesColorFilter;
  });

  // Adicionar handlers para o modal de início de tarefa
  function openStartModal(tarefa: Tarefa) {
    setStartTarefa(tarefa);
    setShowStartModal(true);
  }
  function closeStartModal() {
    setShowStartModal(false);
    setStartTarefa(null);
    setConclusaoData("");
    setConclusaoResponsavel("");
    setConclusaoAnotacoes("");
    setConclusaoFotos([]);
  }
  // 1. Sempre usar data atual como data_conclusao
  function getTodayDate() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  async function handleStartSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startTarefa) return;
    const dataConclusaoValida = getTodayDate();
    const responsavelValido = conclusaoResponsavel && conclusaoResponsavel.trim() !== '' ? conclusaoResponsavel : null;
    let fotosUrls: string[] = [];
    if (conclusaoFotos.length > 0) {
      for (const file of conclusaoFotos) {
        const ext = file.name.split('.').pop();
        const filePath = `${startTarefa.id}/${uuidv4()}.${ext}`;
        const { data, error } = await supabase.storage.from('fotosapp').upload(filePath, file, { upsert: true });
        if (error) {
          console.error('Erro ao fazer upload:', error);
          alert('Erro ao fazer upload: ' + JSON.stringify(error));
        } else {
          const { data: publicUrlData } = supabase.storage.from('fotosapp').getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) fotosUrls.push(publicUrlData.publicUrl);
        }
      }
    }
    await supabase.from("tarefas").update({
      status: "concluida",
      data_conclusao: dataConclusaoValida,
      responsavel_id: responsavelValido,
      anotacoes: conclusaoAnotacoes || null,
      fotos: fotosUrls // sempre array, mesmo vazio
    }).eq("id", startTarefa.id);
    await fetchTarefas();
    closeStartModal();
    toast({ title: "Tarefa concluída!", description: "O admin foi notificado." });
    window.dispatchEvent(new Event('tarefasAtualizadas'));
  }

  // Botão para limpar filtro de imóvel
  const showClearPropertyFilter = !!propertyFilter;

  // Botão para limpar filtro de tarefa por ID
  const showClearTaskIdFilter = !!taskIdFilter;

  // Separar a cor da borda lateral da cor de fundo
  function getCardBorderClass(status: string, diasRestantes: number): string {
    if (status === 'concluida') return 'border-l-4 border-terrah-turquoise';
    if (diasRestantes <= 5) return 'border-l-4 border-destructive';
    if (diasRestantes <= 14) return 'border-l-4 border-terrah-orange';
    if (diasRestantes <= 29) return 'border-l-4 border-yellow-600';
    return 'border-l-4 border-green-600';
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {showClearPropertyFilter && (
        <div className="flex justify-between items-center bg-terrah-turquoise/10 rounded-lg px-4 py-2 mb-2">
          <span className="text-terrah-turquoise font-medium">Filtrando por imóvel</span>
          <Button variant="outline" size="sm" onClick={() => setPropertyFilter(null)}>Limpar filtro</Button>
        </div>
      )}
      {showClearTaskIdFilter && (
        <div className="flex justify-between items-center bg-terrah-turquoise/10 rounded-lg px-4 py-2 mb-2">
          <span className="text-terrah-turquoise font-medium">Filtrando por tarefa específica</span>
          <Button variant="outline" size="sm" onClick={() => setTaskIdFilter(null)}>Limpar filtro</Button>
        </div>
      )}
      {/* Header com título e ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Tarefas
          </h1>
          <Badge variant="secondary" className="text-xs">
            {stats.total} tarefa{stats.total !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hover:bg-muted/50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-terrah-orange/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-terrah-orange" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{stats.pendentes}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{stats.concluidas}</div>
                <div className="text-sm text-muted-foreground">Concluídas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{stats.urgentes}</div>
                <div className="text-sm text-muted-foreground">Urgentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-terrah-turquoise/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-terrah-turquoise" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-terrah-turquoise" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Filtro de Status */}
              <select
                className="border rounded px-3 py-2 text-sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="em_aberto">Pendentes</option>
                <option value="concluida">Concluídas</option>
              </select>
              {/* Filtro por Cor */}
              <select
                className="border rounded px-3 py-2 text-sm"
                value={colorFilter}
                onChange={e => setColorFilter(e.target.value)}
              >
                <option value="all">Todas as cores</option>
                <option value="urgentesEatrasadas">Urgentes e Atrasadas</option>
                <option value="atrasada">Atrasada</option>
                <option value="urgente">Urgente</option>
                <option value="atencao">Atenção</option>
                <option value="moderado">Moderado</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terrah-turquoise mx-auto mb-4"></div>
          Carregando tarefas...
        </div>
      ) : filteredTarefas.length === 0 ? (
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || colorFilter !== 'all'
                ? 'Tente ajustar os filtros ou termos de busca'
                : 'Crie sua primeira tarefa para começar'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && colorFilter === 'all' && isAdmin && (
              <Button
                variant="turquoise"
                className="mt-4 bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise"
                onClick={() => openForm()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTarefas.map((tarefa) => {
            const diasRestantes = calcularDiasRestantes(tarefa.data_vencimento);
            const statusCor = getStatusCor(diasRestantes, tarefa.status);
            const statusLabel = getStatusLabel(diasRestantes);
            const priorityColor = getPriorityColor(diasRestantes);
            const cardDescription = tarefa.status === 'concluida' ? (tarefa.anotacoes || '-') : tarefa.descricao;
            const borderClass = getCardBorderClass(tarefa.status, diasRestantes);
            return (
              <TaskCard
              key={tarefa.id}
                id={tarefa.id}
                title={tarefa.titulo}
              description={cardDescription}
                status={tarefa.status as any}
                  priority={priorityColor}
                dueDate={tarefa.data_vencimento}
                property={imoveis.find(i => i.id === tarefa.imovel_id)?.nome || ""}
                assignee={"-"}
              photosCount={tarefa.fotos?.length || 0}
                responsavel={funcionarios.find(f => f.user_id === tarefa.responsavel_id)?.nome}
                anotacoes={tarefa.anotacoes}
                  diasRestantes={diasRestantes}
                  statusCor={statusCor}
                  statusLabel={statusLabel}
                  onStart={() => openStartModal(tarefa)}
                  createdAt={tarefa.created_at}
                  completedAt={tarefa.data_conclusao}
              className={borderClass}
              editButton={isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => openForm(tarefa)} title="Editar">
                    <Edit className="h-5 w-5" />
                  </Button>
              )}
              photos={tarefa.fotos ?? []}
            />
            );
          })}
      </div>
      )}

      {/* Modal para cadastro/edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2 sm:px-0">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-sm sm:max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
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
                  {funcionarios.filter(f => f.user_id).map(funcionario => (
                    <option key={funcionario.user_id} value={funcionario.user_id}>
                      {funcionario.nome} - {funcionario.cargo || "Sem cargo"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Galeria de fotos já anexadas */}
            {editFotos.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {editFotos.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Foto ${idx+1}`} className="w-16 h-16 object-cover rounded border" />
                    <button type="button" onClick={() => setEditFotos(editFotos.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}
            {/* Upload de novas fotos */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Adicionar Fotos (até {5 - editFotos.length} novas)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={editFotos.length + editNovasFotos.length >= 5}
                onChange={e => {
                  const files = Array.from(e.target.files || []).slice(0, 5 - editFotos.length - editNovasFotos.length);
                  setEditNovasFotos([...editNovasFotos, ...files]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />
              <div className="flex gap-2 flex-wrap mt-2">
                {editNovasFotos.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 object-cover rounded border" />
                    <button type="button" onClick={() => setEditNovasFotos(editNovasFotos.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>
                Cancelar
              </Button>
              {editTarefa && (
                <Button type="button" variant="destructive" className="flex-1" onClick={() => { handleDelete(editTarefa.id); closeForm(); }}>Excluir</Button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Modal de início de tarefa */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2 sm:px-0">
          <form onSubmit={handleStartSubmit} className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">Iniciar Tarefa</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Conclusão
              </label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="date"
                value={conclusaoData}
                onChange={e => setConclusaoData(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User2 className="h-4 w-4" />
                Responsável
              </label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={conclusaoResponsavel}
                onChange={e => setConclusaoResponsavel(e.target.value)}
              >
                <option value="">Sem responsável</option>
                {funcionarios.map(funcionario => (
                  <option key={funcionario.user_id} value={funcionario.user_id}>
                    {funcionario.nome} - {funcionario.cargo || "Sem cargo"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Anotações
              </label>
              <textarea
                className="border rounded px-3 py-2 w-full"
                placeholder="Observações adicionais..."
                value={conclusaoAnotacoes}
                onChange={e => setConclusaoAnotacoes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotos (até 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files || []).slice(0, 5);
                  setConclusaoFotos(files);
                }}
              />
              <div className="flex gap-2 flex-wrap mt-2">
                {conclusaoFotos.map((file, idx) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 object-cover rounded" />
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="flex-1" >
                Concluir
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={closeStartModal}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}