import { supabase } from './supabaseClient';
import type { MetricaAnuncio } from '../../../shared/schema';

// Mapeia slug -> tabela do cliente
function getTableFromSlug(slug?: string): string | null {
  if (!slug) return null;
  
  // Para SA Veículos (cliente existente)
  if (slug === 'saveiculos-dash') return 'dash_sa_veiculos_rows';
  
  // Para novos clientes, usar padrão: dash_<clientSlug>_rows
  // Remove o sufixo '-dash' se existir e converte hífens para underscores
  const baseSlug = slug.replace('-dash', '').replace(/-/g, '_');
  const tableName = `dash_${baseSlug}_rows`;
  
  return tableName;
}

// Adapta linha do Supabase ao schema do app (strings para métricas)
function adaptRowToMetrica(row: any): MetricaAnuncio {
  return {
    idx: Number(row.idx),
    id: String(row.id),
    data_registro: String(row.data_registro),
    nome_anuncio: String(row.nome_anuncio),
    link_criativo: String(row.link_criativo),
    valor_gasto: String(row.valor_gasto),
    conversas_iniciadas: Number(row.conversas_iniciadas),
    custo_por_conversa: String(row.custo_por_conversa),
    impressoes: Number(row.impressoes),
    alcance: Number(row.alcance),
    frequencia: String(row.frequencia),
    cliques_todos: Number(row.cliques_todos),
    cliques_link: Number(row.cliques_link),
    ctr_todos: String(row.ctr_todos),
    ctr_link: String(row.ctr_link),
    cpm: String(row.cpm),
    cpc_todos: String(row.cpc_todos),
    custo_clique_link: String(row.custo_clique_link),
    engajamento_publicacao: Number(row.engajamento_publicacao),
    visualizacoes_video: Number(row.visualizacoes_video),
    custo_visualizacao_video: String(row.custo_visualizacao_video),
    created_at: String(row.created_at),
  };
}

export async function fetchMetricasBySlug(
  slug?: string, 
  dataInicio?: Date, 
  dataFim?: Date
): Promise<MetricaAnuncio[]> {
  console.log('🔍 fetchMetricasBySlug chamado com:', { slug, dataInicio, dataFim });
  
  const table = getTableFromSlug(slug);
  console.log('📊 Tabela mapeada:', table);
  
  if (!table) {
    console.log('❌ Nenhuma tabela encontrada para o slug:', slug);
    return [];
  }

  let query = supabase
    .from(table)
    .select('*')
    .order('data_registro', { ascending: true });

  // Aplicar filtro de período se fornecido
  if (dataInicio) {
    query = query.gte('data_registro', dataInicio.toISOString().split('T')[0]);
    console.log('📅 Filtro dataInicio aplicado:', dataInicio.toISOString().split('T')[0]);
  }
  if (dataFim) {
    query = query.lte('data_registro', dataFim.toISOString().split('T')[0]);
    console.log('📅 Filtro dataFim aplicado:', dataFim.toISOString().split('T')[0]);
  }

  console.log('🚀 Executando consulta Supabase...');
  const { data, error } = await query;

  if (error) {
    console.error('❌ Erro ao buscar métricas do Supabase:', error);
    return [];
  }

  console.log('✅ Dados recebidos do Supabase:', data?.length, 'registros');
  console.log('📋 Primeiros dados:', data?.slice(0, 2));

  return (data || []).map(adaptRowToMetrica);
}

// Interface para vendas
export interface VendaData {
  id: string;
  anuncio_id: string;
  anuncio_titulo: string;
  valor_veiculo: number;
  data_venda: string;
  cliente_slug: string;
  created_at: string;
}

// Mapeia slug -> tabela de vendas do cliente
function getVendasTableFromSlug(slug?: string): string | null {
  if (!slug) return null;
  
  // Para SA Veículos (cliente existente)
  if (slug === 'saveiculos-dash') return 'dash_sa_veiculos_vendas';
  
  // Para novos clientes, usar padrão: dash_<clientSlug>_vendas
  // Converte hífens para underscores
  const baseSlug = slug.replace('-dash', '').replace(/-/g, '_');
  const tableName = `dash_${baseSlug}_vendas`;
  
  return tableName;
}

// Buscar vendas por slug e período
export async function fetchVendasBySlug(
  slug?: string, 
  dataInicio?: Date, 
  dataFim?: Date
): Promise<VendaData[]> {
  if (!slug) return [];

  const vendasTable = getVendasTableFromSlug(slug);
  if (!vendasTable) return [];

  let query = supabase
    .from(vendasTable)
    .select('*')
    .eq('cliente_slug', slug)
    .order('data_venda', { ascending: false });

  // Aplicar filtro de período se fornecido
  if (dataInicio) {
    query = query.gte('data_venda', dataInicio.toISOString());
  }
  if (dataFim) {
    query = query.lte('data_venda', dataFim.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar vendas do Supabase:', error);
    return [];
  }

  return data || [];
}

// Calcular total de vendas por período
export async function calcularVendasPorPeriodo(
  slug?: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<{ total_vendas: number; valor_total: number }> {
  const vendas = await fetchVendasBySlug(slug, dataInicio, dataFim);
  
  return {
    total_vendas: vendas.length,
    valor_total: vendas.reduce((acc, venda) => acc + venda.valor_veiculo, 0)
  };
}