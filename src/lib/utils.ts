import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UnidadePeriodicidade = 'd' | 'm' | 'a' | 'cn';

interface ParsedPeriodicidade {
  valor: number;
  unidade: UnidadePeriodicidade;
}

/**
 * Faz o parsing de uma string de periodicidade e retorna um objeto estruturado.
 * Suporta formatos: "7d", "3m", "1a", "conforme-necessidade", e números "7" (dias).
 */
function parsePeriodicidade(periodicidade: string): ParsedPeriodicidade | null {
  if (!periodicidade || typeof periodicidade !== 'string') return null;

  const cleaned = periodicidade.trim().toLowerCase();
  
  if (cleaned === 'conforme-necessidade' || cleaned === 'conforme necessidade') {
    return { valor: 0, unidade: 'cn' };
  }
  
  if (/^\d+$/.test(cleaned)) {
    return { valor: parseInt(cleaned, 10), unidade: 'd' };
  }

  const match = cleaned.match(/^(\d+)([dma])$/);
  if (match) {
    return { valor: parseInt(match[1], 10), unidade: match[2] as UnidadePeriodicidade };
  }

  return null;
}

/**
 * Calcula a próxima data baseada na periodicidade.
 */
export function calcularProximaData(dataBase: string | Date, periodicidade: string): Date | null {
  const parsed = parsePeriodicidade(periodicidade);
  if (!parsed || parsed.unidade === 'cn') return null;

  const data = new Date(dataBase);
  const { valor, unidade } = parsed;

  switch (unidade) {
    case 'd':
      data.setDate(data.getDate() + valor);
      break;
    case 'm':
      data.setMonth(data.getMonth() + valor);
      break;
    case 'a':
      data.setFullYear(data.getFullYear() + valor);
      break;
  }
  return data;
}

/**
 * Formata uma string de periodicidade para exibição amigável.
 */
export function formatarPeriodicidade(periodicidade: string): string {
  const parsed = parsePeriodicidade(periodicidade);
  if (!parsed) return 'Inválida';

  const { valor, unidade } = parsed;

  if (unidade === 'cn') return 'Conforme necessidade';

  const labels: Record<UnidadePeriodicidade, string[]> = {
    d: ['dia', 'dias'],
    m: ['mês', 'meses'],
    a: ['ano', 'anos'],
    cn: ['', ''],
  };

  const [singular, plural] = labels[unidade];
  return `${valor} ${valor === 1 ? singular : plural}`;
}

/**
 * Valida se uma string de periodicidade está no formato correto.
 */
export function validarPeriodicidade(periodicidade: string): boolean {
  return parsePeriodicidade(periodicidade) !== null;
}

/**
 * Migra periodicidades antigas para o novo formato.
 */
export function migrarPeriodicidadeParaNovoFormato(periodicidadeAntiga: string): string {
  if (!periodicidadeAntiga) return '30d';

  const cleaned = periodicidadeAntiga.trim().toLowerCase();
  
  const mapeamentos: Record<string, string> = {
    'conforme necessidade': 'conforme-necessidade',
    '2 em 2 meses': '2m',
    '12 em 12 meses': '1a',
    '7 em 7 dias': '7d',
    '15 em 15 dias': '15d',
    '3 em 3 meses': '3m'
  };

  if (mapeamentos[cleaned]) return mapeamentos[cleaned];

  const match = cleaned.match(/(\d+)/);
  if (match) {
    const valor = match[1];
    if (cleaned.includes('dia')) return `${valor}d`;
    if (cleaned.includes('mes') || cleaned.includes('mês')) return `${valor}m`;
    if (cleaned.includes('ano')) return `${valor}a`;
  }

  return validarPeriodicidade(cleaned) ? cleaned : '30d';
}

// A função `cn` foi movida para cima para manter a exportação de `supabase` isolada.
// Se `supabase` for usado em outros utilitários, pode ser melhor mantê-lo em seu próprio arquivo.
