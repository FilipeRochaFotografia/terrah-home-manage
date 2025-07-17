import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, User, Clock, AlertTriangle } from "lucide-react";

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  data_vencimento: string;
  data_criacao: string;
  prioridade?: string;
  imoveis: {
    nome: string;
    endereco?: string;
  };
  funcionarios?: {
    nome: string;
    email: string;
  };
}

export default function TarefaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTarefa();
    }
  }, [id]);

  async function fetchTarefa() {
    setLoading(true);
    try {
      // 1. Buscar tarefa sem join
      const { data: tarefaData, error: tarefaError } = await supabase
        .from("tarefas")
        .select("id, titulo, descricao, status, data_vencimento, data_criacao, imovel_id, responsavel_id")
        .eq("id", id)
        .single();

      if (tarefaError || !tarefaData) {
        console.error('Erro ao buscar tarefa:', tarefaError);
        setTarefa(null);
        setLoading(false);
        return;
      }

      // 2. Buscar imóvel
      let imovel = { nome: 'Imóvel não encontrado' };
      if (tarefaData.imovel_id) {
        const { data: imovelData } = await supabase
          .from("imoveis")
          .select("nome, endereco")
          .eq("id", tarefaData.imovel_id)
          .single();
        if (imovelData) imovel = imovelData;
      }

      // 3. Buscar funcionário
      let funcionario = null;
      if (tarefaData.responsavel_id) {
        const { data: funcionarioData } = await supabase
          .from("funcionarios")
          .select("nome, email")
          .eq("id", tarefaData.responsavel_id)
          .single();
        if (funcionarioData) funcionario = funcionarioData;
      }

      setTarefa({
        ...tarefaData,
        imoveis: imovel,
        funcionarios: funcionario
      });
    } catch (err) {
      console.error('Erro inesperado:', err);
      setTarefa(null);
    }
    setLoading(false);
  }

  function calcularDiasRestantes(dataVencimento: string): number {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 24));
    return diffDays;
  }

  function getPrioridadeColor(diasRestantes: number): string {
    if (diasRestantes < 0) return "bg-red-100 text-red-800 border-red-200";
    if (diasRestantes <= 3) return "bg-orange-100 text-orange-800 border-orange-200";
    if (diasRestantes <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (diasRestantes <= 30) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-green-100 text-green-800 border-green-200";
  }

  function getPrioridadeLabel(diasRestantes: number): string {
    if (diasRestantes < 0) return "Atrasada";
    if (diasRestantes <= 3) return "Urgente";
    if (diasRestantes <= 7) return "Atenção";
    if (diasRestantes <= 30) return "Normal";
    return "Baixa";
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-muted-foreground">
          Carregando tarefa...
        </div>
      </div>
    );
  }

  if (!tarefa) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-muted-foreground">
          Tarefa não encontrada.
        </div>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(tarefa.data_vencimento);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
        </div>

        {/* Card Principal */}
        <Card className="border-l-4 border-l-terrah-turquoise">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{tarefa.titulo}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getPrioridadeColor(diasRestantes)}>
                    {getPrioridadeLabel(diasRestantes)}
                  </Badge>
                  <Badge className={getStatusColor(tarefa.status)}>
                    {getStatusLabel(tarefa.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Descrição */}
            {tarefa.descricao && (
              <div>
                <h3 className="font-medium mb-2">Descrição</h3>
                <p className="text-muted-foreground">{tarefa.descricao}</p>
              </div>
            )}

            {/* Imóvel */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{tarefa.imoveis.nome}</p>
                {tarefa.imoveis.endereco && (
                  <p className="text-sm text-muted-foreground">{tarefa.imoveis.endereco}</p>
                )}
              </div>
            </div>

            {/* Responsável */}
            {tarefa.funcionarios && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{tarefa.funcionarios.nome}</p>
                  <p className="text-sm text-muted-foreground">{tarefa.funcionarios.email}</p>
                </div>
              </div>
            )}

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Vencimento</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Criação</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tarefa.data_criacao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Alerta de vencimento */}
            {diasRestantes < 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-red-800 font-medium">
                  Tarefa atrasada há {Math.abs(diasRestantes)} dias
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button 
            className="flex-1 bg-terrah-turquoise hover:bg-terrah-turquoise/90"
          >
            Editar Tarefa
          </Button>
        </div>
      </div>
    </div>
  );
} 