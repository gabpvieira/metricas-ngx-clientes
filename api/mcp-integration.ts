import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables (Vercel)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eoxlbkdsilnaxqpmuqfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveGxia2RzaWxuYXhxcG11cWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjcyNTMsImV4cCI6MjA3NjgwMzI1M30.NmTTGiGn1uMAdEtwnOJ6KGgS7ZR_abZX2etOKCOrWRE";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'eoxlbkdsilnaxqpmuqfb';

console.log(`[VERCEL ENV] SUPABASE_URL: ${SUPABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`[VERCEL ENV] SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[VERCEL ENV] SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[VERCEL ENV] SUPABASE_PROJECT_REF: ${SUPABASE_PROJECT_REF}`);

// Create Supabase client with service role for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

/**
 * Execute a direct query on Supabase
 */
export async function executeSupabaseQuery(projectRef: string, query: string): Promise<any> {
  try {
    console.log(`[VERCEL] Executing query for project ${projectRef}:`, query);
    
    // Handle direct query execution
    return await handleDirectQuery(query);
  } catch (error) {
    console.error('[VERCEL] Error executing Supabase query:', error);
    throw error;
  }
}

/**
 * Handle direct SQL query execution
 */
async function handleDirectQuery(query: string): Promise<any> {
  try {
    console.log('[VERCEL] Executing direct query:', query);
    
    // Extract table name from query for special handling
    const tableMatch = query.match(/FROM\s+(?:public\.)?(\w+)/i);
    const tableName = tableMatch ? tableMatch[1] : '';
    
    // Special handling for configuracoes table
    if (tableName === 'configuracoes') {
      console.log('[VERCEL] Handling configuracoes table query');
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[VERCEL] Supabase error:', error);
        throw error;
      }
      
      console.log('[VERCEL] Configuracoes query result:', data);
      return data || [];
    }
    
    // Special handling for information_schema.tables
    if (query.includes('information_schema.tables')) {
      console.log('[VERCEL] Handling information_schema.tables query');
      const { data, error } = await supabase.rpc('get_table_list');
      
      if (error) {
        console.error('[VERCEL] Error getting table list:', error);
        // Fallback to known tables
        return [
          { table_name: 'configuracoes' },
          { table_name: 'dash_sa_veiculos_rows' },
          { table_name: 'dash_sa_veiculos_vendas' }
        ];
      }
      
      return data || [];
    }
    
    // Special handling for dash_ tables
    if (tableName.startsWith('dash_')) {
      console.log(`[VERCEL] Handling dash table query: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error(`[VERCEL] Error querying ${tableName}:`, error);
        throw error;
      }
      
      console.log(`[VERCEL] ${tableName} query result:`, data);
      return data || [];
    }
    
    // For other queries, try to execute directly using RPC
    console.log('[VERCEL] Executing generic query via RPC');
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
    
    if (error) {
      console.error('[VERCEL] RPC execution error:', error);
      throw error;
    }
    
    return data || [];
    
  } catch (error) {
    console.error('[VERCEL] Error in handleDirectQuery:', error);
    throw error;
  }
}