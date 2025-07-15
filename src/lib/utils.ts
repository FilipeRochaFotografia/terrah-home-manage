import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Faz o parsing de uma string de periodicidade e retorna o número de dias equivalentes
 * Suporta formatos: "7", "7d", "3m", "1a"
 * @param periodicidade - String representando a periodicidade
 * @returns Número de dias ou null se inválido
 */
export function parsePeriodicidade(periodicidade: string): number | null {
  if (!periodicidade || typeof periodicidade !== 'string') {
    return null;
  }

  const cleaned = periodicidade.trim().toLowerCase();
  
  // Conforme necessidade - retorna 0 para indicar periodicidade especial
  if (cleaned === 'conforme_necessidade' || cleaned === 'conforme necessidade') {
    return 0;
  }
  
  // Apenas números (assume dias)
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  // Formato com sufixo
  const match = cleaned.match(/^(\d+)([dma])$/);
  if (!match) {
    return null;
  }

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  switch (unidade) {
    case 'd': // dias
      return valor;
    case 'm': // meses (aproximadamente 30 dias)
      return valor * 30;
    case 'a': // anos (aproximadamente 365 dias)
      return valor * 365;
    default:
      return null;
  }
}

/**
 * Calcula a próxima data baseada na periodicidade
 * @param dataBase - Data base para o cálculo (data de conclusão)
 * @param periodicidade - String de periodicidade
 * @returns Nova data ou null se inválido
 */
export function calcularProximaData(dataBase: string | Date, periodicidade: string): Date | null {
  if (!periodicidade || typeof periodicidade !== 'string') {
    return null;
  }

  const cleaned = periodicidade.trim().toLowerCase();
  
  // Conforme necessidade - não gera próxima data automaticamente
  if (cleaned === 'conforme_necessidade' || cleaned === 'conforme necessidade') {
    return null;
  }
  
  const data = new Date(dataBase);
  
  // Apenas números (assume dias)
  if (/^\d+$/.test(cleaned)) {
    const dias = parseInt(cleaned, 10);
    data.setDate(data.getDate() + dias);
    return data;
  }

  // Formato com sufixo - cálculo preciso
  const match = cleaned.match(/^(\d+)([dma])$/);
  if (!match) {
    return null;
  }

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  switch (unidade) {
    case 'd': // dias
      data.setDate(data.getDate() + valor);
      return data;
    case 'm': // meses (30 dias cada)
      data.setDate(data.getDate() + (valor * 30));
      return data;
    case 'a': // anos (365 dias cada)
      data.setDate(data.getDate() + (valor * 365));
      return data;
    default:
      return null;
  }
}

/**
 * Formata uma string de periodicidade para exibição amigável
 * @param periodicidade - String de periodicidade
 * @returns String formatada para exibição
 */
export function formatarPeriodicidade(periodicidade: string): string {
  if (!periodicidade || typeof periodicidade !== 'string') {
    return 'Periodicidade inválida';
  }

  const cleaned = periodicidade.trim().toLowerCase();
  
  // Conforme necessidade
  if (cleaned === 'conforme_necessidade' || cleaned === 'conforme necessidade') {
    return 'Conforme necessidade';
  }
  
  // Apenas números (assume dias)
  if (/^\d+$/.test(cleaned)) {
    const dias = parseInt(cleaned, 10);
    return dias === 1 ? '1 dia' : `${dias} dias`;
  }

  // Formato com sufixo
  const match = cleaned.match(/^(\d+)([dma])$/);
  if (!match) {
    return 'Periodicidade inválida';
  }

  const valor = parseInt(match[1], 10);
  const unidade = match[2];

  switch (unidade) {
    case 'd':
      return valor === 1 ? '1 dia' : `${valor} dias`;
    case 'm':
      return valor === 1 ? '1 mês' : `${valor} meses`;
    case 'a':
      return valor === 1 ? '1 ano' : `${valor} anos`;
    default:
      return 'Periodicidade inválida';
  }
}

/**
 * Valida se uma string de periodicidade está no formato correto
 * @param periodicidade - String de periodicidade
 * @returns true se válida, false caso contrário
 */
export function validarPeriodicidade(periodicidade: string): boolean {
  return parsePeriodicidade(periodicidade) !== null;
}

/**
 * Normaliza uma string de periodicidade para o formato padrão
 * @param periodicidade - String de periodicidade
 * @returns String normalizada ou null se inválida
 */
export function normalizarPeriodicidade(periodicidade: string): string | null {
  if (!periodicidade || typeof periodicidade !== 'string') {
    return null;
  }

  const cleaned = periodicidade.trim().toLowerCase();
  
  // Apenas números (adiciona 'd')
  if (/^\d+$/.test(cleaned)) {
    return `${cleaned}d`;
  }

  // Formato com sufixo
  const match = cleaned.match(/^(\d+)([dma])$/);
  if (!match) {
    return null;
  }

  return `${match[1]}${match[2]}`;
}

/**
 * Migra periodicidades antigas para o novo formato
 * Esta função pode ser usada para atualizar dados existentes no banco
 */
export function migrarPeriodicidadeParaNovoFormato(periodicidadeAntiga: string): string {
  if (!periodicidadeAntiga || typeof periodicidadeAntiga !== 'string') {
    return '30d'; // Padrão
  }

  const cleaned = periodicidadeAntiga.trim().toLowerCase();

  // Mapeamento baseado nas tarefas do Supabase mostradas na imagem
  const mapeamentos: Record<string, string> = {
    'conforme necessidade': 'conforme_necessidade', // Manter como conforme necessidade
    '2 em 2 meses': '2m',
    '12 em 12 meses': '1a',
    '7 em 7 dias': '7d',
    '15 em 15 dias': '15d',
    '3 em 3 meses': '3m'
  };

  // Verificar se há mapeamento direto
  if (mapeamentos[cleaned]) {
    return mapeamentos[cleaned];
  }

  // Tentar extrair números e palavras-chave
  if (cleaned.includes('dia')) {
    const match = cleaned.match(/(\d+)/);
    if (match) {
      return `${match[1]}d`;
    }
  }

  if (cleaned.includes('mes') || cleaned.includes('mês')) {
    const match = cleaned.match(/(\d+)/);
    if (match) {
      return `${match[1]}m`;
    }
  }

  if (cleaned.includes('ano')) {
    const match = cleaned.match(/(\d+)/);
    if (match) {
      return `${match[1]}a`;
    }
  }

  // Se já está no formato novo, validar e retornar
  if (validarPeriodicidade(cleaned)) {
    return cleaned;
  }

  // Padrão se não conseguir interpretar
  return '30d';
}

/**
 * Converte periodicidade legada baseada na descrição da tarefa
 */
export function interpretarPeriodicidadeDaDescricao(titulo: string, observacao?: string): string {
  const textoCompleto = `${titulo} ${observacao || ''}`.toLowerCase();

  // Padrões específicos para tarefas "conforme necessidade"
  
  // Troca de gás
  if (textoCompleto.includes('troca') && textoCompleto.includes('gás')) {
    return 'conforme_necessidade';
  }
  
  // Tarefas de veículos
  const vehicleTasks = ['abastecimento', 'manutenção', 'lavagem'];
  const vehicleKeywords = ['veículo', 'veiculo', 'automóvel', 'automovel', 'automóveis', 'automoveis', 'carro', 'carros', 'moto', 'motos'];
  
  const hasVehicleTask = vehicleTasks.some(task => textoCompleto.includes(task));
  const hasVehicleKeyword = vehicleKeywords.some(keyword => textoCompleto.includes(keyword));
  
  if (hasVehicleTask && hasVehicleKeyword) {
    return 'conforme_necessidade'; // Conforme necessidade
  }
  
  // Padrões específicos baseados na imagem do Supabase
  if (textoCompleto.includes('manutenção preventiva') && textoCompleto.includes('ar condicion')) {
    return '3m'; // 3 em 3 meses
  }
  
  if (textoCompleto.includes('jateamento') && textoCompleto.includes('ar condicion')) {
    return '1a'; // 12 em 12 meses
  }
  
  if (textoCompleto.includes('higienização') && textoCompleto.includes('estofados')) {
    return '2m'; // 2 em 2 meses
  }
  
  if (textoCompleto.includes('manutenção') && textoCompleto.includes('boxes')) {
    return '1a'; // 12 em 12 meses
  }
  
  if (textoCompleto.includes('lavagem') && textoCompleto.includes('caixa')) {
    return '1a'; // 12 em 12 meses
  }
  
  if (textoCompleto.includes('dedetização')) {
    return '2m'; // 2 em 2 meses
  }
  
  if (textoCompleto.includes('pintura')) {
    return '1a'; // 12 em 12 meses
  }
  
  if (textoCompleto.includes('troca') && (textoCompleto.includes('pilhas') || textoCompleto.includes('controle'))) {
    return '2m'; // 2 em 2 meses
  }
  
  if (textoCompleto.includes('limpeza') && textoCompleto.includes('almoxarifado')) {
    return '7d'; // 7 em 7 dias
  }
  
  if (textoCompleto.includes('lavagem') && textoCompleto.includes('automóveis')) {
    return '15d'; // 15 em 15 dias
  }
  
  if (textoCompleto.includes('limpeza') && textoCompleto.includes('trilhos')) {
    return '7d'; // 7 em 7 dias
  }
  
  if (textoCompleto.includes('troca') && textoCompleto.includes('roldanas')) {
    return '1a'; // 12 em 12 meses
  }
  
  if (textoCompleto.includes('troca') && textoCompleto.includes('refil')) {
    return '2m'; // 2 em 2 meses
  }

  // Padrão para casos não mapeados
  return '30d';
}
