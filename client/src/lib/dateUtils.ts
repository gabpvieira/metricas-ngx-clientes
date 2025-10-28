import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfToday, endOfToday } from 'date-fns';

export interface PeriodRange {
  dataInicio: Date;
  dataFim: Date;
  label: string;
}

/**
 * Calcula o intervalo de datas baseado no período selecionado
 * Usa date-fns para cálculos precisos de datas
 */
export function calcularPeriodo(period: string): PeriodRange {
  const hoje = new Date();
  
  switch (period) {
    case "hoje":
      return {
        dataInicio: startOfToday(),
        dataFim: endOfToday(),
        label: "Hoje"
      };
      
    case "7dias":
      return {
        dataInicio: startOfDay(subDays(hoje, 6)), // Últimos 7 dias incluindo hoje
        dataFim: endOfDay(hoje),
        label: "Últimos 7 dias"
      };
      
    case "30dias":
      return {
        dataInicio: startOfDay(subDays(hoje, 29)), // Últimos 30 dias incluindo hoje
        dataFim: endOfDay(hoje),
        label: "Últimos 30 dias"
      };
      
    case "mes-atual":
      return {
        dataInicio: startOfMonth(hoje),
        dataFim: endOfMonth(hoje),
        label: "Mês atual"
      };
      
    case "mes-passado":
      const mesPassado = subMonths(hoje, 1);
      return {
        dataInicio: startOfMonth(mesPassado),
        dataFim: endOfMonth(mesPassado),
        label: "Mês passado"
      };
      
    default:
      // Default para últimos 30 dias
      return {
        dataInicio: startOfDay(subDays(hoje, 29)),
        dataFim: endOfDay(hoje),
        label: "Últimos 30 dias"
      };
  }
}

/**
 * Formata uma data para string no formato ISO (YYYY-MM-DD)
 * Para uso em queries do Supabase
 */
export function formatDateForSupabase(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Verifica se uma data está dentro do período especificado
 */
export function isDateInPeriod(date: string | Date, dataInicio: Date, dataFim: Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate >= dataInicio && targetDate <= dataFim;
}

/**
 * Filtra métricas por período de data
 */
export function filtrarMetricasPorPeriodo<T extends { data_registro: string }>(
  metricas: T[], 
  dataInicio: Date, 
  dataFim: Date
): T[] {
  return metricas.filter(metrica => 
    isDateInPeriod(metrica.data_registro, dataInicio, dataFim)
  );
}