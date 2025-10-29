import type { ResumoMetricas } from "@shared/schema";

export type FeedbackLevel = 'excellent' | 'good' | 'acceptable' | 'warning' | 'critical';

export interface PerformanceFeedback {
  tipo: 'cpl' | 'performance' | 'roi';
  nivel: FeedbackLevel;
  titulo: string;
  mensagem: string;
  valor?: string;
}

/**
 * Calcula feedback de Custo Por Lead (CPL)
 */
export function calcularFeedbackCPL(resumo: ResumoMetricas): PerformanceFeedback | null {
  const cpl = resumo.custo_medio_conversa;
  
  if (!cpl || resumo.conversas_iniciadas === 0) {
    return null;
  }

  let nivel: FeedbackLevel;
  let mensagem: string;

  if (cpl <= 8.00) {
    nivel = 'excellent';
    mensagem = 'Seu custo por lead está excelente!';
  } else if (cpl <= 12.00) {
    nivel = 'good';
    mensagem = 'Bom desempenho nos leads gerados.';
  } else if (cpl <= 15.00) {
    nivel = 'acceptable';
    mensagem = 'Resultados dentro do esperado.';
  } else if (cpl <= 30.00) {
    nivel = 'warning';
    mensagem = 'Atenção: o custo por lead está alto.';
  } else {
    nivel = 'critical';
    mensagem = '⚠️ Custo por lead fora do ideal!';
  }

  return {
    tipo: 'cpl',
    nivel,
    titulo: 'CPL (Custo Por Lead)',
    mensagem,
    valor: `R$ ${cpl.toFixed(2)}`
  };
}

/**
 * Calcula feedback de Performance baseada em Mensagens e Cliques
 */
export function calcularFeedbackPerformance(resumo: ResumoMetricas): PerformanceFeedback {
  const conversas = resumo.conversas_iniciadas;
  const cliques = resumo.cliques_todos || 0;
  const leads = resumo.vendas_geradas || 0;

  let nivel: FeedbackLevel;
  let mensagem: string;
  let valor: string;

  // Análise baseada na relação entre cliques, conversas e leads
  const taxaConversaoCliques = cliques > 0 ? (conversas / cliques) * 100 : 0;
  const taxaConversaoLeads = conversas > 0 ? (leads / conversas) * 100 : 0;

  // Baseado na média nacional brasileira: 3,5% a 6,25%
  if (taxaConversaoLeads >= 6.25) {
    nivel = 'excellent';
    mensagem = 'Taxa de conversão excelente! Acima da média nacional.';
    valor = `${taxaConversaoLeads.toFixed(1)}% conversão`;
  } else if (taxaConversaoLeads >= 4.5) {
    nivel = 'good';
    mensagem = 'Boa taxa de conversão, dentro da média nacional.';
    valor = `${taxaConversaoLeads.toFixed(1)}% conversão`;
  } else if (taxaConversaoLeads >= 3.5) {
    nivel = 'acceptable';
    mensagem = 'Taxa de conversão aceitável, no limite da média nacional.';
    valor = `${taxaConversaoLeads.toFixed(1)}% conversão`;
  } else if (conversas > 0 && leads === 0) {
    nivel = 'warning';
    mensagem = 'Gerando conversas mas sem leads efetivos.';
    valor = `0% conversão`;
  } else if (taxaConversaoLeads > 0) {
    nivel = 'warning';
    mensagem = 'Taxa de conversão abaixo da média nacional (3,5%).';
    valor = `${taxaConversaoLeads.toFixed(1)}% conversão`;
  } else {
    nivel = 'critical';
    mensagem = 'Sem conversão de leads. Necessário revisar estratégia.';
    valor = `${taxaConversaoLeads.toFixed(1)}% conversão`;
  }

  return {
    tipo: 'performance',
    nivel,
    titulo: 'Taxa de Conversão',
    mensagem,
    valor
  };
}

/**
 * Calcula feedback de ROI
 */
export function calcularFeedbackROI(resumo: ResumoMetricas): PerformanceFeedback | null {
  const roi = resumo.roi;
  
  if (roi === undefined || roi === null) {
    return null;
  }

  let nivel: FeedbackLevel;
  let mensagem: string;

  // Nova lógica para ROI em contexto de vendas de veículos (análise mensal)
  // Para vendas de carros, o ROI deve ser analisado no contexto mensal
  if (roi >= 300) {
    nivel = 'excellent';
    mensagem = 'Excelente ROI mensal! Estratégia de marketing muito eficiente.';
  } else if (roi >= 150) {
    nivel = 'good';
    mensagem = 'Bom retorno mensal sobre o investimento em marketing.';
  } else if (roi >= 50) {
    nivel = 'acceptable';
    mensagem = 'ROI mensal aceitável para o setor automotivo.';
  } else if (roi > 0) {
    nivel = 'acceptable';
    mensagem = 'ROI positivo, continue monitorando ao longo do mês.';
  } else {
    nivel = 'warning';
    mensagem = 'Investimento ainda não gerou retorno positivo este mês.';
  }

  return {
    tipo: 'roi',
    nivel,
    titulo: 'ROI Mensal',
    mensagem,
    valor: `${roi.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`
  };
}

/**
 * Gera todos os feedbacks relevantes baseados no tipo de negócio
 */
export function gerarFeedbacks(
  resumo: ResumoMetricas, 
  tipoNegocio: 'mensagens' | 'vendas'
): PerformanceFeedback[] {
  const feedbacks: PerformanceFeedback[] = [];

  // Feedback de CPL (sempre relevante)
  const feedbackCPL = calcularFeedbackCPL(resumo);
  if (feedbackCPL) {
    feedbacks.push(feedbackCPL);
  }

  // Feedback de Performance (sempre relevante)
  const feedbackPerformance = calcularFeedbackPerformance(resumo);
  feedbacks.push(feedbackPerformance);

  // Feedback de ROI (mais relevante para tipo vendas, mas útil para ambos)
  const feedbackROI = calcularFeedbackROI(resumo);
  if (feedbackROI) {
    feedbacks.push(feedbackROI);
  }

  return feedbacks;
}
