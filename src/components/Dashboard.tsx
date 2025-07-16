import { useEffect, useState } from "react";
import { CheckCircle, Clock, Home, Plus, AlertTriangle, TrendingUp, Users, Calendar, MapPin, UserCheck, RefreshCw, Bell, Filter, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface DashboardStats {
  tarefasPendentes: number;
  tarefasConcluidasHoje: number;
  tarefasAtrasadas: number;
  imoveisAtivos: number;
  tarefasConcluidasSemana: number;
  tarefasCriadasHoje: number;
  tarefasUrgentes: number; // 5 dias ou menos
  tarefasAtencao: number; // 6-14 dias
  tarefasModeradas: number; // 15-29 dias
  tarefasNormais: number; // 30+ dias
  tarefasAtrasadasRelatorio: number; // Adicionado para o relatório
}

interface AtividadeRecente {
  id: string;
  titulo: string;
  tipo: 'conclusao' | 'criacao' | 'inicio' | 'atraso';
  imovel: string;
  responsavel: string;
  timestamp: string;
  status?: string;
}

// Renomeado e expandido para ser mais genérico
interface TarefaDetalhada {
  id: string;
  titulo: string;
  data_vencimento: string;
  imovel_id: string;
  responsavel_id: string;
  diasRestantes: number;
  imovel?: string;
  responsavel?: string;
  status?: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    tarefasPendentes: 0,
    tarefasConcluidasHoje: 0,
    tarefasAtrasadas: 0,
    imoveisAtivos: 0,
    tarefasConcluidasSemana: 0,
    tarefasCriadasHoje: 0,
    tarefasUrgentes: 0,
    tarefasAtencao: 0,
    tarefasModeradas: 0,
    tarefasNormais: 0,
    tarefasAtrasadasRelatorio: 0
  });
  const [atividadesRecentes, setAtividadesRecentes] = useState<AtividadeRecente[]>([]);
  const [tarefasUrgentes, setTarefasUrgentes] = useState<TarefaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertas, setAlertas] = useState<{tipo: 'atraso' | 'urgente' | 'pendente', mensagem: string, count: number}[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const isMobile = useIsMobile();
  const [imoveis, setImoveis] = useState<{id: string, nome: string}[]>([]);
  const [funcionarios, setFuncionarios] = useState<{id: string, nome: string, user_id: string}[]>([]);
  const [tarefasUrgentesRaw, setTarefasUrgentesRaw] = useState<TarefaDetalhada[]>([]);
  const [alertasFechados, setAlertasFechados] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('alertasFechados');
    return saved ? JSON.parse(saved) : [];
  });
  const [showReportModal, setShowReportModal] = useState(false); // Added state for modal
  const [reportModalTitle, setReportModalTitle] = useState(''); // Added state for modal
  const [reportModalCount, setReportModalCount] = useState(0); // Added state for modal
  const [reportModalColor, setReportModalColor] = useState(''); // Added state for modal
  const [reportTasks, setReportTasks] = useState<TarefaDetalhada[]>([]); // Estado para as tarefas do relatório
  const [loadingReport, setLoadingReport] = useState(false); // Estado de loading para o modal


  useEffect(() => {
    fetchDashboardData();
    // fetchAtividadesRecentes(); // Comentado para evitar erro 400

    // Buscar imóveis e funcionários
    async function fetchImoveis() {
      const { data } = await supabase.from("imoveis").select("id, nome");
      if (data) setImoveis(data);
    }
    async function fetchFuncionarios() {
      const { data } = await supabase.from("funcionarios").select("id, nome, user_id");
      if (data) setFuncionarios(data);
    }
    fetchImoveis();
    fetchFuncionarios();
  }, [periodoFiltro, alertasFechados]);

  useEffect(() => {
    setTarefasUrgentes(
      tarefasUrgentesRaw.map(tarefa => ({
        ...tarefa,
        imovel: imoveis.find(i => i.id === tarefa.imovel_id)?.nome || 'Imóvel não especificado',
        responsavel: funcionarios.find(f => f.user_id === tarefa.responsavel_id)?.nome || 'Sem responsável',
      }))
    );
  }, [tarefasUrgentesRaw, imoveis, funcionarios]);

  function calcularDiasRestantes(dataVencimento: string): number {
    // Padronizar para ignorar horas/minutos/segundos
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getStatusCor(diasRestantes: number): string {
    if (diasRestantes <= 5) return 'text-destructive bg-destructive/10';
    if (diasRestantes <= 14) return 'text-terrah-orange bg-terrah-orange/10';
    if (diasRestantes <= 29) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
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

  async function fetchDashboardData() {
    setLoading(true);
    
    try {
      // Calcular datas baseadas no filtro
      const hoje = new Date();
      const inicioPeriodo = new Date();
      
      switch (periodoFiltro) {
        case 'hoje':
          inicioPeriodo.setHours(0, 0, 0, 0);
          break;
        case 'semana':
          inicioPeriodo.setDate(hoje.getDate() - 7);
          break;
        case 'mes':
          inicioPeriodo.setMonth(hoje.getMonth() - 1);
          break;
      }

      const inicioPeriodoStr = inicioPeriodo.toISOString().split('T')[0];
      const hojeStr = hoje.toISOString().split('T')[0];

      // Tarefas pendentes
      const { count: pendentes } = await supabase
        .from('tarefas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_aberto');

      // Tarefas concluídas no período
      const { count: concluidasPeriodo } = await supabase
        .from('tarefas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'concluida')
        .gte('data_conclusao', inicioPeriodoStr);

      // Tarefas atrasadas
      const { count: atrasadas } = await supabase
        .from('tarefas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_aberto')
        .lt('data_vencimento', hojeStr);

      // Tarefas criadas no período
      const { count: criadasPeriodo } = await supabase
        .from('tarefas')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', inicioPeriodoStr);

      // Imóveis ativos
      const { count: imoveisAtivos } = await supabase
        .from('imoveis')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Buscar tarefas pendentes para análise de prazo (INCLUIR atrasadas)
      const { data: tarefasPendentesUrgentes, error: tarefasError } = await supabase
        .from('tarefas')
        .select(`
          id,
          titulo,
          data_vencimento,
          imovel_id,
          responsavel_id
        `)
        .eq('status', 'em_aberto')
        .lte('data_vencimento', new Date(new Date().setDate(new Date().getDate() + 5)).toISOString()) // Pega tarefas que vencem em até 5 dias
        .order('data_vencimento', { ascending: true }) // Ordena pelas mais antigas primeiro
        .limit(3); // Limita aos 3 resultados

      if (tarefasError) {
        console.error("Erro ao buscar tarefas urgentes:", tarefasError);
      }

      const { data: todasTarefasPendentes } = await supabase
        .from('tarefas')
        .select(`id, data_vencimento`)
        .eq('status', 'em_aberto');

      // Analisar prazos de TODAS as tarefas pendentes para os contadores
      let urgentes = 0, atencao = 0, moderadas = 0, normais = 0, atrasadasRelatorio = 0;

      if (todasTarefasPendentes) {
        todasTarefasPendentes.forEach(tarefa => {
          const diasRestantes = calcularDiasRestantes(tarefa.data_vencimento);
          if (diasRestantes < 0) {
            atrasadasRelatorio++;
            urgentes++;
          } else if (diasRestantes <= 5) {
            urgentes++;
          } else if (diasRestantes <= 14) {
            atencao++;
          } else if (diasRestantes <= 29) {
            moderadas++;
          } else {
            normais++;
          }
        });
      }

      // A lista de tarefas urgentes para exibição é a que já foi limitada
      const tarefasUrgentesList: TarefaDetalhada[] = tarefasPendentesUrgentes?.map(tarefa => ({
        id: tarefa.id,
        titulo: tarefa.titulo,
        data_vencimento: tarefa.data_vencimento,
        imovel_id: tarefa.imovel_id,
        responsavel_id: tarefa.responsavel_id,
        diasRestantes: calcularDiasRestantes(tarefa.data_vencimento)
      })) || [];

      setStats({
        tarefasPendentes: pendentes || 0,
        tarefasConcluidasHoje: concluidasPeriodo || 0,
        tarefasAtrasadas: atrasadas || 0,
        imoveisAtivos: imoveisAtivos || 0,
        tarefasConcluidasSemana: concluidasPeriodo || 0,
        tarefasCriadasHoje: criadasPeriodo || 0,
        tarefasUrgentes: urgentes,
        tarefasAtencao: atencao,
        tarefasModeradas: moderadas,
        tarefasNormais: normais,
        tarefasAtrasadasRelatorio: atrasadasRelatorio // Adicionado para o relatório
      });

      setTarefasUrgentesRaw(tarefasUrgentesList);

      // Gerar alertas baseados em prazos
      const novosAlertas = [];
      if (atrasadas > 0) {
        novosAlertas.push({
          tipo: 'atraso',
          mensagem: `${atrasadas} tarefa${atrasadas > 1 ? 's' : ''} atrasada${atrasadas > 1 ? 's' : ''}`,
          count: atrasadas
        });
      }
      if (urgentes > 0) {
        novosAlertas.push({
          tipo: 'urgente',
          mensagem: `${urgentes} tarefa${urgentes > 1 ? 's' : ''} com prazo crítico (≤5 dias)`,
          count: urgentes
        });
      }
      if (atencao > 0) {
        novosAlertas.push({
          tipo: 'pendente',
          mensagem: `${atencao} tarefa${atencao > 1 ? 's' : ''} precisam de atenção (6-14 dias)`,
          count: atencao
        });
      }
      const filtrados = novosAlertas.filter(a => !alertasFechados.includes(a.tipo));
      setAlertas(filtrados);

      // Buscar atividades recentes
      await fetchAtividadesRecentes();

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }

  async function fetchAtividadesRecentes() {
    try {
      // Buscar tarefas recentes com informações de imóvel e responsável
      const { data: tarefas } = await supabase
        .from('tarefas')
        .select(`
          id,
          titulo,
          status,
          created_at,
          updated_at,
          imovel_id,
          responsavel_id
        `)
        .order('updated_at', { ascending: false })
        .limit(5);

      // LOG TEMPORÁRIO PARA DEBUG
      console.log('tarefas recentes para atividade:', tarefas);

      if (tarefas) {
        setAtividadesRecentes(
          tarefas.map(tarefa => {
            return {
              id: tarefa.id,
              titulo: tarefa.titulo,
              tipo: tarefa.status === 'concluida' ? 'conclusao' : (tarefa.status === 'em_aberto' ? 'inicio' : 'criacao'),
              imovel: imoveis.find(i => i.id === tarefa.imovel_id)?.nome || 'Imóvel não especificado',
              responsavel: funcionarios.find(f => f.user_id === tarefa.responsavel_id)?.nome || 'Sistema',
              timestamp: new Date(tarefa.updated_at || tarefa.created_at).toISOString(),
              status: tarefa.status
            };
          })
        );
      }
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
    }
  }

  function handleNovaTarefa() {
    // Navegar para a aba de tarefas e abrir modal de nova tarefa
    const event = new CustomEvent('navigateToTab', { detail: 'tasks' });
    window.dispatchEvent(event);
    
    // Disparar evento para abrir modal de nova tarefa
    setTimeout(() => {
      const novaTarefaEvent = new CustomEvent('openNewTaskModal');
      window.dispatchEvent(novaTarefaEvent);
    }, 100);
  }

  function handleGerenciarImoveis() {
    // Navegar para a aba de imóveis
    const event = new CustomEvent('navigateToTab', { detail: 'properties' });
    window.dispatchEvent(event);
  }

  function formatTimeAgo(timestamp: string) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'há poucos minutos';
    if (diffInHours === 1) return 'há 1 hora';
    if (diffInHours < 24) return `há ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'há 1 dia';
    return `há ${diffInDays} dias`;
  }

  function getActivityIcon(tipo: AtividadeRecente['tipo']) {
    switch (tipo) {
      case 'conclusao': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'criacao': return <Plus className="h-4 w-4 text-terrah-orange" />;
      case 'inicio': return <Clock className="h-4 w-4 text-terrah-turquoise" />;
      case 'atraso': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  }

  function getActivityColor(tipo: AtividadeRecente['tipo']) {
    switch (tipo) {
      case 'conclusao': return 'from-success/5 to-success/10 border-success/20';
      case 'criacao': return 'from-terrah-orange/5 to-terrah-orange/10 border-terrah-orange/20';
      case 'inicio': return 'from-terrah-turquoise/5 to-terrah-turquoise/10 border-terrah-turquoise/20';
      case 'atraso': return 'from-destructive/5 to-destructive/10 border-destructive/20';
    }
  }

  function getActivityDotColor(tipo: AtividadeRecente['tipo']) {
    switch (tipo) {
      case 'conclusao': return 'bg-success';
      case 'criacao': return 'bg-terrah-orange';
      case 'inicio': return 'bg-terrah-turquoise';
      case 'atraso': return 'bg-destructive';
    }
  }

  const getPeriodoLabel = () => {
    switch (periodoFiltro) {
      case 'hoje': return 'Hoje';
      case 'semana': return 'Última Semana';
      case 'mes': return 'Último Mês';
    }
  };

  const getPeriodoStatsLabel = () => {
    switch (periodoFiltro) {
      case 'hoje': return 'Concluídas Hoje';
      case 'semana': return 'Concluídas na Semana';
      case 'mes': return 'Concluídas no Mês';
    }
  };

const statsData = [
  {
    title: "Tarefas Pendentes",
      value: stats.tarefasPendentes.toString(),
    icon: Clock,
    color: "text-terrah-orange",
    bg: "bg-terrah-orange/10",
      trend: stats.tarefasCriadasHoje > 0 ? `+${stats.tarefasCriadasHoje}` : "0",
    trendUp: stats.tarefasCriadasHoje > 0,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'tasks' }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('clearTaskIdFilter'));
        window.dispatchEvent(new CustomEvent('setStatusFilter', { detail: 'em_aberto' }));
      }, 100);
    },
  },
  {
      title: getPeriodoStatsLabel(),
      value: stats.tarefasConcluidasHoje.toString(),
    icon: CheckCircle,
    color: "text-terrah-turquoise",
    bg: "bg-terrah-turquoise/10",
      trend: stats.tarefasConcluidasHoje > 0 ? `+${stats.tarefasConcluidasHoje}` : "0",
    trendUp: true,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'tasks' }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('clearTaskIdFilter'));
        window.dispatchEvent(new CustomEvent('setTaskColorFilter', { detail: 'all' }));
        window.dispatchEvent(new CustomEvent('setStatusFilter', { detail: 'concluida' }));
      }, 100);
    },
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg"></div>
          <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-muted rounded-xl"></div>
                  <div className="w-8 h-4 bg-muted rounded"></div>
                </div>
                <div className="h-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ajustar handleOpenReportModal para aceitar 'pendentes' e 'concluidas'
  async function handleOpenReportModal(type: 'pendentes' | 'concluidas' | 'normal' | 'moderado' | 'atencao' | 'urgente') {
    setLoadingReport(true);
    setShowReportModal(true);

    let title = '';
    let color = '';
    let minDays = 0;
    let maxDays = Infinity;

    switch (type) {
      case 'normal':
        title = 'Tarefas Normais';
        color = 'bg-green-500';
        minDays = 30;
        break;
      case 'moderado':
        title = 'Tarefas Moderadas';
        color = 'bg-yellow-500';
        minDays = 15;
        maxDays = 29;
        break;
      case 'atencao':
        title = 'Tarefas que Requerem Atenção';
        color = 'bg-orange-500';
        minDays = 6;
        maxDays = 14;
        break;
      case 'urgente':
        title = 'Tarefas Urgentes';
        color = 'bg-red-500';
        maxDays = 5;
        minDays = -Infinity; // Inclui atrasadas
        break;
    }

    setReportModalTitle(title);
    setReportModalColor(color);
    
    // Buscar as tarefas correspondentes
    const hoje = new Date();
    const dataMin = new Date(hoje);
    dataMin.setDate(hoje.getDate() + minDays);
    
    const dataMax = new Date(hoje);
    if(maxDays !== Infinity) {
      dataMax.setDate(hoje.getDate() + maxDays);
    }

    const query = supabase
      .from('tarefas')
      .select('id, titulo, data_vencimento, imovel_id, responsavel_id, status')
      .eq('status', 'em_aberto');

    if (minDays !== -Infinity) {
      query.gte('data_vencimento', dataMin.toISOString().split('T')[0]);
    }
    if (maxDays !== Infinity) {
      query.lte('data_vencimento', dataMax.toISOString().split('T')[0]);
    }
    
    const { data: tarefas, error } = await query;
    
    if (error) {
      console.error(`Erro ao buscar tarefas para o relatório '${type}':`, error);
      setLoadingReport(false);
      return;
    }
    
    const tarefasDetalhadas: TarefaDetalhada[] = tarefas.map(t => ({
      ...t,
      imovel: imoveis.find(i => i.id === t.imovel_id)?.nome || 'N/A',
      responsavel: funcionarios.find(f => f.user_id === t.responsavel_id)?.nome || 'N/A',
      diasRestantes: calcularDiasRestantes(t.data_vencimento),
    }));

    setReportTasks(tarefasDetalhadas);
    setReportModalCount(tarefasDetalhadas.length);
    setLoadingReport(false);
  }

  function handleCloseReportModal() {
    setShowReportModal(false);
    setReportModalTitle('');
    setReportModalCount(0);
    setReportModalColor('');
    setReportTasks([]);
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header com título, filtros e refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <Badge variant="secondary" className="text-xs">
            {getPeriodoLabel()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filtros de período */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={periodoFiltro === 'hoje' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriodoFiltro('hoje')}
              className="text-xs h-8"
            >
              Hoje
            </Button>
            <Button
              variant={periodoFiltro === 'semana' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriodoFiltro('semana')}
              className="text-xs h-8"
            >
              Semana
            </Button>
            <Button
              variant={periodoFiltro === 'mes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriodoFiltro('mes')}
              className="text-xs h-8"
            >
              Mês
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hover:bg-muted/50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="flex-1 h-12 bg-gradient-to-r from-terrah-turquoise to-terrah-turquoise/90 hover:from-terrah-turquoise/90 hover:to-terrah-turquoise shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
          variant="turquoise"
          onClick={handleNovaTarefa}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
        <Button 
          className="flex-1 h-12 bg-gradient-to-r from-terrah-orange to-terrah-orange/90 hover:from-terrah-orange/90 hover:to-terrah-orange shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
          variant="orange"
          onClick={handleGerenciarImoveis}
        >
          <Home className="mr-2 h-4 w-4" />
          Gerenciar Imóveis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {statsData.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={stat.onClick}
          >
            {/* Gradiente sutil de fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-terrah-turquoise/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-2 relative z-10">
              <div className="relative flex items-center justify-center">
                <span className={`absolute w-14 h-14 rounded-full ${stat.bg} opacity-10`}></span>
                <div className="flex items-center justify-center gap-2 mx-auto z-10">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <p className="text-sm text-muted-foreground font-medium text-center">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tarefas Urgentes */}
      {tarefasUrgentes.length > 0 && (
        <Card className="hover:shadow-lg transition-all duration-300 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tarefas Urgentes (≤5 dias)
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-xs"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'tasks' }));
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('clearTaskIdFilter'));
                    window.dispatchEvent(new CustomEvent('setTaskColorFilter', { detail: 'urgentesEatrasadas' }));
                  }, 100);
                }}
              >
                Ver todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tarefasUrgentes.map((tarefa) => (
                <div 
                  key={tarefa.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'tasks' }));
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('clearColorFilter'));
                      window.dispatchEvent(new CustomEvent('filterTasksById', { detail: tarefa.id }));
                    }, 100);
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-destructive animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tarefa.titulo}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{tarefa.imovel}</span>
                      <span>•</span>
                      <UserCheck className="h-3 w-3" />
                      <span className="truncate">{tarefa.responsavel}</span>
                      <span>•</span>
                      <Badge variant="destructive" className="text-xs">
                        {getStatusLabel(tarefa.diasRestantes)}
                        {tarefa.diasRestantes > 1 ? ` (${tarefa.diasRestantes} dias)` : ''}
                      </Badge>
                    </div>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatórios */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-terrah-turquoise" />
            Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200 cursor-pointer" onClick={() => handleOpenReportModal('normal')}>
              <div className="text-2xl font-bold text-green-600">{stats.tarefasNormais}</div>
              <div className="text-sm text-muted-foreground">Normal (30+ dias)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer" onClick={() => handleOpenReportModal('moderado')}>
              <div className="text-2xl font-bold text-yellow-600">{stats.tarefasModeradas}</div>
              <div className="text-sm text-muted-foreground">Moderado (15-29 dias)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200 cursor-pointer" onClick={() => handleOpenReportModal('atencao')}>
              <div className="text-2xl font-bold text-orange-600">{stats.tarefasAtencao}</div>
              <div className="text-sm text-muted-foreground">Atenção (6-14 dias)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200 cursor-pointer" onClick={() => handleOpenReportModal('urgente')}>
              <div className="text-2xl font-bold text-red-600">{stats.tarefasUrgentes}</div>
              <div className="text-sm text-muted-foreground">Urgentes (≤5 dias)</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de relatório */}
      <Dialog open={showReportModal} onOpenChange={handleCloseReportModal}>
        <DialogContent className="max-w-3xl">
          <div className="p-2">
            <div className="flex items-center gap-4 mb-6">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center ${reportModalColor}`}>
                 <span className="text-3xl font-bold text-white">{reportModalCount}</span>
               </div>
              <DialogTitle className="text-2xl font-bold">{reportModalTitle}</DialogTitle>
            </div>
            
            {loadingReport ? (
              <div className="text-center p-8">Carregando tarefas...</div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-4">
                {reportTasks.length > 0 ? (
                  reportTasks.map(tarefa => (
                    <div 
                      key={tarefa.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                    >
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
    </div>
  );
}