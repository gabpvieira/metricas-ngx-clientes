import type { MetricaAnuncio } from "@shared/schema";

export interface MetricaAnuncioAgregada extends Omit<MetricaAnuncio, 'data_registro' | 'id' | 'idx'> {
  id: string; // ID único para o anúncio agregado
  idx: number; // Índice único
  data_registro: string; // Data mais recente dos anúncios agregados
  data_inicio: string; // Data mais antiga dos anúncios agregados
  data_fim: string; // Data mais recente dos anúncios agregados
  total_dias: number; // Quantidade de dias que o anúncio rodou
  anuncios_originais: MetricaAnuncio[]; // Array com todos os anúncios originais
}

/**
 * Agrega anúncios com o mesmo nome, somando suas métricas
 * @param metricas Array de métricas originais
 * @returns Array de métricas agregadas por nome do anúncio
 */
export function aggregateAdsByName(metricas: MetricaAnuncio[]): MetricaAnuncioAgregada[] {
  // Agrupa anúncios por nome
  const gruposAnuncios = metricas.reduce((grupos, metrica) => {
    const nomeAnuncio = metrica.nome_anuncio.trim();
    
    if (!grupos[nomeAnuncio]) {
      grupos[nomeAnuncio] = [];
    }
    
    grupos[nomeAnuncio].push(metrica);
    return grupos;
  }, {} as Record<string, MetricaAnuncio[]>);

  // Converte grupos em métricas agregadas
  const metricasAgregadas: MetricaAnuncioAgregada[] = [];
  let idx = 1;

  Object.entries(gruposAnuncios).forEach(([nomeAnuncio, anunciosGrupo]) => {
    // Ordena anúncios por data para pegar primeira e última
    const anunciosOrdenados = anunciosGrupo.sort((a, b) => 
      new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime()
    );

    const primeiroAnuncio = anunciosOrdenados[0];
    const ultimoAnuncio = anunciosOrdenados[anunciosOrdenados.length - 1];

    // Calcula métricas agregadas
    const metricaAgregada: MetricaAnuncioAgregada = {
      id: `agregado_${nomeAnuncio.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
      idx: idx++,
      nome_anuncio: nomeAnuncio,
      link_criativo: primeiroAnuncio.link_criativo, // Usa o link do primeiro anúncio
      data_registro: ultimoAnuncio.data_registro, // Data mais recente para ordenação
      data_inicio: primeiroAnuncio.data_registro,
      data_fim: ultimoAnuncio.data_registro,
      total_dias: anunciosGrupo.length,
      created_at: ultimoAnuncio.created_at,
      anuncios_originais: anunciosGrupo,

      // Soma das métricas numéricas
      conversas_iniciadas: anunciosGrupo.reduce((sum, a) => sum + a.conversas_iniciadas, 0),
      impressoes: anunciosGrupo.reduce((sum, a) => sum + a.impressoes, 0),
      alcance: anunciosGrupo.reduce((sum, a) => sum + a.alcance, 0),
      cliques_todos: anunciosGrupo.reduce((sum, a) => sum + a.cliques_todos, 0),
      cliques_link: anunciosGrupo.reduce((sum, a) => sum + a.cliques_link, 0),
      engajamento_publicacao: anunciosGrupo.reduce((sum, a) => sum + a.engajamento_publicacao, 0),
      visualizacoes_video: anunciosGrupo.reduce((sum, a) => sum + a.visualizacoes_video, 0),

      // Soma das métricas de valor (convertendo string para number)
      valor_gasto: anunciosGrupo.reduce((sum, a) => sum + parseFloat(a.valor_gasto || '0'), 0).toFixed(2),

      // Cálculos de métricas derivadas
      custo_por_conversa: '',
      frequencia: '',
      ctr_todos: '',
      ctr_link: '',
      cpm: '',
      cpc_todos: '',
      custo_clique_link: '',
      custo_visualizacao_video: '',
    };

    // Calcula métricas derivadas
    const totalGasto = parseFloat(metricaAgregada.valor_gasto);
    const totalConversas = metricaAgregada.conversas_iniciadas;
    const totalImpressoes = metricaAgregada.impressoes;
    const totalCliques = metricaAgregada.cliques_todos;
    const totalCliquesLink = metricaAgregada.cliques_link;
    const totalAlcance = metricaAgregada.alcance;
    const totalVisualizacoes = metricaAgregada.visualizacoes_video;

    // Custo por conversa
    metricaAgregada.custo_por_conversa = totalConversas > 0 
      ? (totalGasto / totalConversas).toFixed(2)
      : '0.00';

    // CTR (Click Through Rate)
    metricaAgregada.ctr_todos = totalImpressoes > 0 
      ? ((totalCliques / totalImpressoes) * 100).toFixed(2)
      : '0.00';

    metricaAgregada.ctr_link = totalImpressoes > 0 
      ? ((totalCliquesLink / totalImpressoes) * 100).toFixed(2)
      : '0.00';

    // CPM (Custo por Mil Impressões)
    metricaAgregada.cpm = totalImpressoes > 0 
      ? ((totalGasto / totalImpressoes) * 1000).toFixed(2)
      : '0.00';

    // CPC (Custo por Clique)
    metricaAgregada.cpc_todos = totalCliques > 0 
      ? (totalGasto / totalCliques).toFixed(2)
      : '0.00';

    metricaAgregada.custo_clique_link = totalCliquesLink > 0 
      ? (totalGasto / totalCliquesLink).toFixed(2)
      : '0.00';

    // Frequência média (média ponderada pelo alcance)
    const frequenciaMedia = anunciosGrupo.reduce((sum, a) => {
      const freq = parseFloat(a.frequencia || '0');
      return sum + (freq * a.alcance);
    }, 0);
    metricaAgregada.frequencia = totalAlcance > 0 
      ? (frequenciaMedia / totalAlcance).toFixed(2)
      : '0.00';

    // Custo por visualização de vídeo
    metricaAgregada.custo_visualizacao_video = totalVisualizacoes > 0 
      ? (totalGasto / totalVisualizacoes).toFixed(2)
      : '0.00';

    metricasAgregadas.push(metricaAgregada);
  });

  return metricasAgregadas;
}

/**
 * Verifica se há anúncios duplicados (mesmo nome) nos dados
 * @param metricas Array de métricas
 * @returns Objeto com informações sobre duplicatas
 */
export function checkForDuplicateAds(metricas: MetricaAnuncio[]) {
  const nomesCounts = metricas.reduce((counts, metrica) => {
    const nome = metrica.nome_anuncio.trim();
    counts[nome] = (counts[nome] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const duplicados = Object.entries(nomesCounts)
    .filter(([_, count]) => count > 1)
    .map(([nome, count]) => ({ nome, count }));

  return {
    hasDuplicates: duplicados.length > 0,
    duplicates: duplicados,
    totalOriginal: metricas.length,
    totalAfterAggregation: Object.keys(nomesCounts).length,
    reductionCount: metricas.length - Object.keys(nomesCounts).length
  };
}