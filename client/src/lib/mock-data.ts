import type { MetricaAnuncio, ClienteInfo, ResumoMetricas } from "@shared/schema";

//todo: remove mock functionality
export const mockClientes: ClienteInfo[] = [
  {
    nome: "SA Veículos",
    slug: "saveiculos-dash",
    logo_url: "/placeholder-logo.png",
    tipo_negocio: "mensagens",
    meta_mensal_conversas: 10,
    meta_mensal_investimento: 5000,
    meta_mensal_vendas: 3
  },
  {
    nome: "AutoPrime Veículos",
    slug: "autoprime-dash",
    logo_url: "/placeholder-logo.png",
    tipo_negocio: "vendas",
    meta_mensal_investimento: 8000,
    meta_mensal_vendas: 5,
    meta_roi: 300
  }
];

//todo: remove mock functionality
export const mockMetricas: MetricaAnuncio[] = [
  {
    idx: 0,
    id: "8f7e788f-e3d2-4cd4-8f87-ba213cad2fa4",
    data_registro: "2025-10-16",
    nome_anuncio: "HILUX SW4 - 23/24",
    link_criativo: "https://www.facebook.com/317363595530343_1250352540443398",
    valor_gasto: "1.1",
    conversas_iniciadas: 0,
    custo_por_conversa: "0",
    impressoes: 45,
    alcance: 39,
    cliques_todos: 5,
    cliques_link: 1,
    ctr_todos: "11.111111",
    ctr_link: "2.222222",
    cpm: "24.444444",
    cpc_todos: "0.22",
    custo_clique_link: "1.1",
    frequencia: "1.153846",
    engajamento_publicacao: 8,
    visualizacoes_video: 7,
    custo_visualizacao_video: "0.15714285714285717",
    created_at: "2025-10-23 11:45:39.410942+00"
  },
  {
    idx: 1,
    id: "123e4567-e89b-12d3-a456-426614174000",
    data_registro: "2025-10-16",
    nome_anuncio: "AMAROK 3.0 V6 - 2024",
    link_criativo: "https://www.facebook.com/317363595530343_1250352540443399",
    valor_gasto: "35.38",
    conversas_iniciadas: 2,
    custo_por_conversa: "17.69",
    impressoes: 1896,
    alcance: 1244,
    cliques_todos: 44,
    cliques_link: 38,
    ctr_todos: "2.32",
    ctr_link: "2.00",
    cpm: "18.67",
    cpc_todos: "0.80",
    custo_clique_link: "0.93",
    frequencia: "1.52",
    engajamento_publicacao: 52,
    visualizacoes_video: 1234,
    custo_visualizacao_video: "0.03",
    created_at: "2025-10-23 11:45:39.410942+00"
  },
  {
    idx: 2,
    id: "223e4567-e89b-12d3-a456-426614174001",
    data_registro: "2025-10-15",
    nome_anuncio: "RANGER XLT 4x4 - 2023",
    link_criativo: "https://www.facebook.com/317363595530343_1250352540443400",
    valor_gasto: "28.50",
    conversas_iniciadas: 1,
    custo_por_conversa: "28.50",
    impressoes: 1450,
    alcance: 980,
    cliques_todos: 32,
    cliques_link: 28,
    ctr_todos: "2.21",
    ctr_link: "1.93",
    cpm: "19.66",
    cpc_todos: "0.89",
    custo_clique_link: "1.02",
    frequencia: "1.48",
    engajamento_publicacao: 38,
    visualizacoes_video: 890,
    custo_visualizacao_video: "0.03",
    created_at: "2025-10-22 11:45:39.410942+00"
  },
  {
    idx: 3,
    id: "323e4567-e89b-12d3-a456-426614174002",
    data_registro: "2025-10-14",
    nome_anuncio: "S10 HIGH COUNTRY - 2024",
    link_criativo: "https://www.facebook.com/317363595530343_1250352540443401",
    valor_gasto: "18.20",
    conversas_iniciadas: 0,
    custo_por_conversa: "0",
    impressoes: 890,
    alcance: 675,
    cliques_todos: 18,
    cliques_link: 15,
    ctr_todos: "2.02",
    ctr_link: "1.69",
    cpm: "20.45",
    cpc_todos: "1.01",
    custo_clique_link: "1.21",
    frequencia: "1.32",
    engajamento_publicacao: 22,
    visualizacoes_video: 560,
    custo_visualizacao_video: "0.03",
    created_at: "2025-10-21 11:45:39.410942+00"
  },
  {
    idx: 4,
    id: "423e4567-e89b-12d3-a456-426614174003",
    data_registro: "2025-10-13",
    nome_anuncio: "TORO ULTRA 4x4 - 2023",
    link_criativo: "https://www.facebook.com/317363595530343_1250352540443402",
    valor_gasto: "12.75",
    conversas_iniciadas: 0,
    custo_por_conversa: "0",
    impressoes: 645,
    alcance: 512,
    cliques_todos: 12,
    cliques_link: 10,
    ctr_todos: "1.86",
    ctr_link: "1.55",
    cpm: "19.77",
    cpc_todos: "1.06",
    custo_clique_link: "1.28",
    frequencia: "1.26",
    engajamento_publicacao: 16,
    visualizacoes_video: 420,
    custo_visualizacao_video: "0.03",
    created_at: "2025-10-20 11:45:39.410942+00"
  }
];

//todo: remove mock functionality
export function calcularResumo(metricas: MetricaAnuncio[], tipoNegocio: 'mensagens' | 'vendas' = 'mensagens'): ResumoMetricas {
  const investimento_total = metricas.reduce((acc, m) => acc + parseFloat(m.valor_gasto), 0);
  const conversas_iniciadas = metricas.reduce((acc, m) => acc + m.conversas_iniciadas, 0);
  const impressoes = metricas.reduce((acc, m) => acc + m.impressoes, 0);
  const alcance = metricas.reduce((acc, m) => acc + m.alcance, 0);
  const cliques_todos = metricas.reduce((acc, m) => acc + m.cliques_todos, 0);
  const cliques_link = metricas.reduce((acc, m) => acc + m.cliques_link, 0);
  
  const ctr_medio = metricas.length > 0 
    ? metricas.reduce((acc, m) => acc + parseFloat(m.ctr_todos), 0) / metricas.length 
    : 0;
  
  const cpm_medio = metricas.length > 0 
    ? metricas.reduce((acc, m) => acc + parseFloat(m.cpm), 0) / metricas.length 
    : 0;
  
  const cpc_medio = metricas.length > 0 
    ? metricas.reduce((acc, m) => acc + parseFloat(m.cpc_todos), 0) / metricas.length 
    : 0;
  
  const frequencia_media = metricas.length > 0 
    ? metricas.reduce((acc, m) => acc + parseFloat(m.frequencia), 0) / metricas.length 
    : 0;
  
  const engajamento_total = metricas.reduce((acc, m) => acc + m.engajamento_publicacao, 0);
  const visualizacoes_video = metricas.reduce((acc, m) => acc + m.visualizacoes_video, 0);
  
  const custo_medio_conversa = conversas_iniciadas > 0 
    ? investimento_total / conversas_iniciadas 
    : 0;
  
  //todo: remove mock functionality - calculate from real sales data
  const vendas_geradas = tipoNegocio === 'mensagens' 
    ? Math.floor(conversas_iniciadas * 0.3) // 30% conversion rate for demo
    : Math.floor(conversas_iniciadas * 0.5); // 50% for sales-focused
  
  const ticket_medio = tipoNegocio === 'vendas' ? 50000 : 45000; // mock ticket médio
  const receita_total = vendas_geradas * ticket_medio;
  const roi = investimento_total > 0 ? ((receita_total - investimento_total) / investimento_total) * 100 : 0;
  
  return {
    investimento_total,
    conversas_iniciadas,
    custo_medio_conversa,
    impressoes,
    alcance,
    cliques_todos,
    cliques_link,
    ctr_medio,
    cpm_medio,
    cpc_medio,
    frequencia_media,
    engajamento_total,
    visualizacoes_video,
    vendas_geradas,
    receita_total,
    roi,
    ticket_medio
  };
}

//todo: remove mock functionality
export function gerarInsights(metricas: MetricaAnuncio[]): Array<{
  tipo: 'success' | 'opportunity' | 'warning';
  mensagem: string;
}> {
  const insights: Array<{ tipo: 'success' | 'opportunity' | 'warning'; mensagem: string }> = [];
  
  const melhorAnuncio = [...metricas].sort((a, b) => b.conversas_iniciadas - a.conversas_iniciadas)[0];
  if (melhorAnuncio && melhorAnuncio.conversas_iniciadas > 0) {
    insights.push({
      tipo: 'success',
      mensagem: `${melhorAnuncio.nome_anuncio.substring(0, 20)}... gerou ${melhorAnuncio.conversas_iniciadas} conversa(s) (melhor anúncio)`
    });
  }
  
  const altoCtr = metricas.find(m => parseFloat(m.ctr_todos) > 5);
  if (altoCtr) {
    insights.push({
      tipo: 'opportunity',
      mensagem: `${altoCtr.nome_anuncio.substring(0, 20)}... tem CTR de ${parseFloat(altoCtr.ctr_todos).toFixed(1)}% - considere aumentar budget`
    });
  }
  
  const baixoCtr = metricas.find(m => parseFloat(m.ctr_todos) < 1 && parseFloat(m.valor_gasto) > 10);
  if (baixoCtr) {
    insights.push({
      tipo: 'warning',
      mensagem: `${baixoCtr.nome_anuncio.substring(0, 20)}... tem CTR baixo (${parseFloat(baixoCtr.ctr_todos).toFixed(1)}%) - revisar criativo`
    });
  }
  
  return insights;
}
