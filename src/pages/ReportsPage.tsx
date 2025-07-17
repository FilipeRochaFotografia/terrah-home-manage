import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, FileText, BarChart3, PieChart, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TarefaRelatorio {
  id: string;
  titulo: string;
  status: string;
  data_vencimento: string;
  data_conclusao?: string;
  imovel_id: string;
  responsavel_id?: string;
  imovel_nome?: string;
  funcionario_nome?: string;
  diasRestantes: number;
  categoria: 'atrasada' | 'urgente' | 'atencao' | 'normal';
}

interface FiltrosRelatorio {
  dataInicio: string;
  dataFim: string;
  imovelId?: string;
  funcionarioId?: string;
}

interface MetricasRelatorio {
  totalPendentes: number;
  totalAtrasadas: number;
  totalUrgentes: number;
  totalAtencao: number;
  totalNormais: number;
  totalConcluidas: number;
  taxaAtraso: number;
  tarefasPorImovel: Record<string, number>;
  tarefasPorFuncionario: Record<string, number>;
}

export default function ReportsPage() {
  const { imoveis, funcionarios } = useData();
  const [tarefas, setTarefas] = useState<TarefaRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });
  const [mostrarTodasTarefas, setMostrarTodasTarefas] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');

  // Calcular dias restantes
  const calcularDiasRestantes = (dataVencimento: string): number => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Categorizar tarefa por prazo
  const categorizarTarefa = (diasRestantes: number): 'atrasada' | 'urgente' | 'atencao' | 'normal' => {
    if (diasRestantes < 0) return 'atrasada';
    if (diasRestantes <= 5) return 'urgente';
    if (diasRestantes <= 14) return 'atencao';
    return 'normal';
  };

  // Buscar dados do relatório
  const buscarDadosRelatorio = async () => {
    setLoading(true);
    try {
      // Buscar TODAS as tarefas primeiro (para debug)
      let queryTodas = supabase
        .from('tarefas')
        .select(`
          id,
          titulo,
          status,
          data_vencimento,
          data_conclusao,
          imovel_id,
          responsavel_id
        `);

      // Aplicar filtros adicionais
      if (filtros.imovelId) {
        queryTodas = queryTodas.eq('imovel_id', filtros.imovelId);
      }

      if (filtros.funcionarioId) {
        queryTodas = queryTodas.eq('responsavel_id', filtros.funcionarioId);
      }

      const { data: todasTarefas, error } = await queryTodas;

      if (error) throw error;



      const tarefasProcessadas: TarefaRelatorio[] = (todasTarefas || []).map(tarefa => {
        const diasRestantes = calcularDiasRestantes(tarefa.data_vencimento);
        const categoria = categorizarTarefa(diasRestantes);
        
        return {
          ...tarefa,
          diasRestantes,
          categoria,
          imovel_nome: imoveis.find(i => i.id === tarefa.imovel_id)?.nome || 'N/A',
          funcionario_nome: funcionarios.find(f => f.user_id === tarefa.responsavel_id)?.nome || 'N/A'
        };
      });

      setTarefas(tarefasProcessadas);
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas
  const metricas = useMemo((): MetricasRelatorio => {
    const pendentes = tarefas.filter(t => t.status === 'em_aberto');
    const concluidas = tarefas.filter(t => t.status === 'concluida');
    const atrasadas = pendentes.filter(t => t.categoria === 'atrasada');
    const urgentes = pendentes.filter(t => t.categoria === 'urgente');
    const atencao = pendentes.filter(t => t.categoria === 'atencao');
    const normais = pendentes.filter(t => t.categoria === 'normal');

    // Tarefas por imóvel
    const tarefasPorImovel: Record<string, number> = {};
    pendentes.forEach(t => {
      const imovelNome = t.imovel_nome || 'N/A';
      tarefasPorImovel[imovelNome] = (tarefasPorImovel[imovelNome] || 0) + 1;
    });

    // Tarefas por funcionário
    const tarefasPorFuncionario: Record<string, number> = {};
    pendentes.forEach(t => {
      const funcionarioNome = t.funcionario_nome || 'N/A';
      tarefasPorFuncionario[funcionarioNome] = (tarefasPorFuncionario[funcionarioNome] || 0) + 1;
    });

    return {
      totalPendentes: pendentes.length,
      totalAtrasadas: atrasadas.length,
      totalUrgentes: urgentes.length,
      totalAtencao: atencao.length,
      totalNormais: normais.length,
      totalConcluidas: concluidas.length,
      taxaAtraso: pendentes.length > 0 ? Math.round((atrasadas.length / pendentes.length) * 100) : 0,
      tarefasPorImovel,
      tarefasPorFuncionario
    };
  }, [tarefas]);

  // Dados para gráfico pizza - Mostrar todas as tarefas com categorias corretas
  const dadosPizza = useMemo(() => {
    // Contar todas as tarefas por categoria (incluindo concluídas)
    const todasTarefas = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === 'concluida').length;
    const pendentes = tarefas.filter(t => t.status === 'em_aberto');
    
    // Categorizar tarefas pendentes por prazo
    const atrasadas = pendentes.filter(t => t.categoria === 'atrasada').length;
    const urgentes = pendentes.filter(t => t.categoria === 'urgente').length;
    const atencao = pendentes.filter(t => t.categoria === 'atencao').length;
    const normais = pendentes.filter(t => t.categoria === 'normal').length;



    return {
      labels: ['Concluídas', 'Atrasadas', 'Urgentes', 'Atenção', 'Normais'],
      datasets: [{
        data: [concluidas, atrasadas, urgentes, atencao, normais],
        backgroundColor: [
          'rgba(14, 165, 233, 0.7)',   // Azul com opacidade
          'rgba(239, 68, 68, 0.7)',    // Vermelho com opacidade
          'rgba(249, 115, 22, 0.7)',   // Laranja com opacidade
          'rgba(245, 158, 11, 0.7)',   // Amarelo com opacidade
          'rgba(16, 185, 129, 0.7)'    // Verde com opacidade
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [tarefas]);

  // Dados para gráfico barras - Imóveis
  const dadosBarrasImoveis = useMemo(() => ({
    labels: Object.keys(metricas.tarefasPorImovel),
    datasets: [{
      label: 'Tarefas Pendentes',
      data: Object.values(metricas.tarefasPorImovel),
      backgroundColor: 'rgba(14, 165, 233, 0.7)', // Azul turquesa com opacidade
      borderColor: 'rgba(2, 132, 199, 0.8)',
      borderWidth: 1
    }]
  }), [metricas.tarefasPorImovel]);

  // Dados para gráfico barras - Funcionários
  const dadosBarrasFuncionarios = useMemo(() => ({
    labels: Object.keys(metricas.tarefasPorFuncionario),
    datasets: [{
      label: 'Tarefas Atribuídas',
      data: Object.values(metricas.tarefasPorFuncionario),
      backgroundColor: 'rgba(249, 115, 22, 0.7)', // Laranja com opacidade
      borderColor: 'rgba(234, 88, 12, 0.8)',
      borderWidth: 1
    }]
  }), [metricas.tarefasPorFuncionario]);

  // Filtrar tarefas por status
  const tarefasFiltradas = useMemo(() => {
    switch (filtroStatus) {
      case 'pendentes':
        return tarefas.filter(t => t.status === 'em_aberto');
      case 'concluidas':
        return tarefas.filter(t => t.status === 'concluida');
      default:
        return tarefas;
    }
  }, [tarefas, filtroStatus]);

  // Limitar tarefas para exibição (ordenadas da mais antiga para a mais nova)
  const tarefasExibidas = useMemo(() => {
    const tarefasOrdenadas = [...tarefasFiltradas].sort((a, b) => {
      const dataA = new Date(a.data_vencimento);
      const dataB = new Date(b.data_vencimento);
      return dataA.getTime() - dataB.getTime(); // Ordem crescente (mais antiga primeiro)
    });
    
    return mostrarTodasTarefas ? tarefasOrdenadas : tarefasOrdenadas.slice(0, 3);
  }, [tarefasFiltradas, mostrarTodasTarefas]);

  // Exportar para CSV
  const exportarCSV = () => {
    const csvData = tarefas.map(t => ({
      'Título': t.titulo,
      'Status': t.status,
      'Imóvel': t.imovel_nome,
      'Responsável': t.funcionario_nome,
      'Vencimento': t.data_vencimento,
      'Dias Restantes': t.diasRestantes,
      'Categoria': t.categoria
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_tarefas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar para PDF
  const exportarPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      // Header
      pdf.setFontSize(20);
      pdf.text('Relatório de Tarefas - Terrah Homes', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Período: ${filtros.dataInicio} a ${filtros.dataFim}`, 20, 35);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);

      // Métricas
      pdf.setFontSize(14);
      pdf.text('Métricas Principais:', 20, 65);
      
      pdf.setFontSize(10);
      pdf.text(`Total de Tarefas Pendentes: ${metricas.totalPendentes}`, 20, 80);
      pdf.text(`Tarefas Atrasadas: ${metricas.totalAtrasadas}`, 20, 90);
      pdf.text(`Taxa de Atraso: ${metricas.taxaAtraso}%`, 20, 100);

      // Tabela de tarefas
      pdf.setFontSize(12);
      pdf.text('Detalhamento de Tarefas:', 20, 120);

      let y = 135;
      tarefas.slice(0, 20).forEach((tarefa, index) => {
        if (y > 250) {
          pdf.addPage();
          y = 20;
        }
        
        pdf.setFontSize(8);
        pdf.text(`${index + 1}. ${tarefa.titulo}`, 20, y);
        pdf.text(`   Imóvel: ${tarefa.imovel_nome} | Responsável: ${tarefa.funcionario_nome}`, 20, y + 5);
        pdf.text(`   Vencimento: ${tarefa.data_vencimento} | Dias: ${tarefa.diasRestantes}`, 20, y + 10);
        y += 20;
      });

      pdf.save(`relatorio_tarefas_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  useEffect(() => {
    buscarDadosRelatorio();
  }, [filtros]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">📊 Relatórios Avançados</h1>
          <p className="text-muted-foreground">Análise detalhada de tarefas e performance</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={exportarPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-terrah-turquoise" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Imóvel</label>
              <Select
                value={filtros.imovelId || ''}
                onValueChange={(value) => setFiltros(prev => ({ 
                  ...prev, 
                  imovelId: value === 'todos' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os imóveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os imóveis</SelectItem>
                  {imoveis.map(imovel => (
                    <SelectItem key={imovel.id} value={imovel.id}>
                      {imovel.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Funcionário</label>
              <Select
                value={filtros.funcionarioId || ''}
                onValueChange={(value) => setFiltros(prev => ({ 
                  ...prev, 
                  funcionarioId: value === 'todos' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os funcionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os funcionários</SelectItem>
                  {funcionarios.map(funcionario => (
                    <SelectItem key={funcionario.user_id} value={funcionario.user_id}>
                      {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="hover:shadow-lg transition-all duration-300 border-orange-300">
          <CardHeader className="pb-2 px-3 py-3">
            <div className="flex items-center justify-between">
              <Clock className="h-6 w-6 text-orange-500" />
              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-white text-xs px-2 py-1">{metricas.totalPendentes}</Badge>
            </div>
            <CardTitle className="text-xs font-medium">Pendentes</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-blue-300">
          <CardHeader className="pb-2 px-3 py-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-6 w-6 text-blue-500" />
              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-white text-xs px-2 py-1">{metricas.totalConcluidas}</Badge>
            </div>
            <CardTitle className="text-xs font-medium">Concluídas</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-red-300">
          <CardHeader className="pb-2 px-3 py-3">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <Badge variant="outline" className="text-red-600 border-red-300 bg-white text-xs px-2 py-1">{metricas.totalAtrasadas}</Badge>
            </div>
            <CardTitle className="text-xs font-medium">Atrasadas</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-green-300">
          <CardHeader className="pb-2 px-3 py-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <Badge variant="outline" className="text-green-600 border-green-300 bg-white text-xs px-2 py-1">{metricas.totalNormais}</Badge>
            </div>
            <CardTitle className="text-xs font-medium">No Prazo</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico Pizza - Status das Tarefas */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-terrah-turquoise" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <Pie 
                data={dadosPizza}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Barras - Tarefas por Imóvel */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-terrah-turquoise" />
              Tarefas por Imóvel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <Bar 
                data={dadosBarrasImoveis}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    },
                    x: {
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de Atraso - Card Compacto */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-terrah-orange" />
            Taxa de Atraso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-terrah-orange mb-1">
                {metricas.taxaAtraso}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metricas.totalAtrasadas} de {metricas.totalPendentes} tarefas pendentes estão atrasadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Barras - Tarefas por Funcionário */}
      <Card className="hover:shadow-lg transition-all duration-300 mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-terrah-turquoise" />
            Tarefas por Funcionário
          </CardTitle>
        </CardHeader>
                  <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <Bar 
                data={dadosBarrasFuncionarios}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    },
                    x: {
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
      </Card>

      {/* Resumo das Tarefas */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-terrah-turquoise" />
              Resumo das Tarefas ({tarefasFiltradas.length} de {tarefas.length} total)
            </CardTitle>
            
            {/* Filtro de Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setFiltroStatus('todas')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    filtroStatus === 'todas' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltroStatus('pendentes')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    filtroStatus === 'pendentes' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setFiltroStatus('concluidas')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    filtroStatus === 'concluidas' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Concluídas
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tarefasExibidas.length > 0 ? (
              <>
                {tarefasExibidas.map(tarefa => (
                  <div key={tarefa.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{tarefa.titulo}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>🏠 {tarefa.imovel_nome}</span>
                        <span>👤 {tarefa.funcionario_nome}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            tarefa.categoria === 'atrasada' ? 'text-red-600 bg-red-100' :
                            tarefa.categoria === 'urgente' ? 'text-orange-600 bg-orange-100' :
                            tarefa.categoria === 'atencao' ? 'text-yellow-600 bg-yellow-100' :
                            'text-green-600 bg-green-100'
                          }
                        >
                          {tarefa.categoria === 'atrasada' ? `Atrasada ${-tarefa.diasRestantes}d` :
                           tarefa.categoria === 'urgente' ? `Urgente ${tarefa.diasRestantes}d` :
                           tarefa.categoria === 'atencao' ? `Atenção ${tarefa.diasRestantes}d` :
                           `Normal ${tarefa.diasRestantes}d`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Botão para expandir/contrair */}
                {tarefasFiltradas.length > 3 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrarTodasTarefas(!mostrarTodasTarefas)}
                      className="text-xs"
                    >
                      {mostrarTodasTarefas 
                        ? `Mostrar menos (${tarefasFiltradas.length - 3} a menos)` 
                        : `Mostrar mais (${tarefasFiltradas.length - 3} tarefas restantes)`
                      }
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground p-8">
                Nenhuma tarefa encontrada para os filtros selecionados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 