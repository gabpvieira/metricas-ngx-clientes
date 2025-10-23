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
 * Calcula feedback de Performance Geral (CTR, CPC, CPM)
 */
export function calcularFeedbackPerformance(resumo: ResumoMetricas): PerformanceFeedback {
  const ctr = resumo.ctr_medio;
  const cpc = resumo.cpc_medio;
  const cpm = resumo.cpm_medio;
  const frequencia = resumo.frequencia_media;

  let nivel: FeedbackLevel;
  let mensagem: string;
  let valor: string;

  // Regras de performance
  if (ctr > 3 && cpc < 1.00) {
    nivel = 'excellent';
    mensagem = 'Excelente engajamento e custo por clique.';
    valor = `CTR: ${ctr.toFixed(1)}% | CPC: R$ ${cpc.toFixed(2)}`;
  } else if (cpm > 30.00 || frequencia > 4) {
    nivel = 'warning';
    mensagem = 'Público pode estar saturado.';
    valor = cpm > 30 
      ? `CPM: R$ ${cpm.toFixed(2)}` 
      : `Frequência: ${frequencia.toFixed(1)}`;
  } else if (ctr < 1 && cpc > 2.00) {
    nivel = 'critical';
    mensagem = 'Baixo engajamento e alto custo.';
    valor = `CTR: ${ctr.toFixed(1)}% | CPC: R$ ${cpc.toFixed(2)}`;
  } else if (ctr >= 1 && ctr <= 3 && cpc >= 1 && cpc <= 2) {
    nivel = 'acceptable';
    mensagem = 'Desempenho dentro da média esperada.';
    valor = `CTR: ${ctr.toFixed(1)}% | CPC: R$ ${cpc.toFixed(2)}`;
  } else {
    // Caso padrão baseado no CTR
    if (ctr >= 2) {
      nivel = 'good';
      mensagem = 'Bom engajamento com o público.';
    } else {
      nivel = 'acceptable';
      mensagem = 'Desempenho aceitável, há espaço para melhorar.';
    }
    valor = `CTR: ${ctr.toFixed(1)}% | CPC: R$ ${cpc.toFixed(2)}`;
  }

  return {
    tipo: 'performance',
    nivel,
    titulo: 'Performance Geral',
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

  if (roi >= 200) {
    nivel = 'excellent';
    mensagem = 'Ótimo retorno sobre investimento!';
  } else if (roi >= 100) {
    nivel = 'good';
    mensagem = 'Bom retorno, continue assim!';
  } else if (roi >= 50) {
    nivel = 'acceptable';
    mensagem = 'Retorno razoável, há espaço para melhorar.';
  } else {
    nivel = 'warning';
    mensagem = '⚠️ Retorno muito abaixo do ideal.';
  }

  return {
    tipo: 'roi',
    nivel,
    titulo: 'ROI (Retorno sobre Investimento)',
    mensagem,
    valor: `${roi.toFixed(0)}%`
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
