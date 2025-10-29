import { createClient } from '@supabase/supabase-js';

export async function executeSupabaseQuery(query: string) {
  console.log('[MCP Integration] Executando query:', query);
  
  try {
    const result = await handleDirectQuery(query);
    return result;
  } catch (error) {
    console.error('[MCP Integration] Erro ao executar query:', error);
    throw error;
  }
}

async function handleDirectQuery(query: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
  
  if (error) {
    throw error;
  }
  
  return data;
}