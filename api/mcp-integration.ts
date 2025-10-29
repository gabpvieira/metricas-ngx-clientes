const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from environment variables (Vercel)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eoxlbkdsilnaxqpmuqfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveGxia2RzaWxuYXhxcG11cWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjcyNTMsImV4cCI6MjA3NjgwMzI1M30.NmTTGiGn1uMAdEtwnOJ6KGgS7ZR_abZX2etOKCOrWRE";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveGxia2RzaWxuYXhxcG11cWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNzI1MywiZXhwIjoyMDc2ODAzMjUzfQ.8A1vkYn-wj1HvlaulrKMzhK98W-4CAqo33AKCpCTyZU";
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'eoxlbkdsilnaxqpmuqfb';

console.log(`[VERCEL ENV] SUPABASE_URL: ${SUPABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`[VERCEL ENV] SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[VERCEL ENV] SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[VERCEL ENV] SUPABASE_PROJECT_REF: ${SUPABASE_PROJECT_REF}`);

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[VERCEL ERROR] Missing required Supabase environment variables');
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client with service role for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Execute a direct query on Supabase
 */
async function executeSupabaseQuery(projectRef: string, query: string): Promise<any> {
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
    const selectMatch = query.match(/SELECT \* FROM (?:public\.)?(\w+)/i);
    const tableName = selectMatch ? selectMatch[1] : '';
    
    console.log(`[VERCEL] Extracted table name: ${tableName}`);
    
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
      
      console.log('[VERCEL] Configuracoes query result:', data?.length, 'records');
      return data || [];
    }
    
    // Special handling for information_schema.tables
    if (query.includes('information_schema.tables')) {
      console.log('[VERCEL] Handling information_schema.tables query');
      // Return known tables directly since RPC might not be available
      const knownTables = [
        { table_name: 'configuracoes' },
        { table_name: 'dash_sa_veiculos_rows' },
        { table_name: 'dash_sa_veiculos_vendas' },
        { table_name: 'dash_ngx_veiculos_rows' },
        { table_name: 'dash_ngx_veiculos_vendas' },
        { table_name: 'dash_gabriel_seminovos_rows' },
        { table_name: 'dash_gabriel_seminovos_vendas' }
      ];
      
      console.log('[VERCEL] Returning known tables:', knownTables.length);
      return knownTables;
    }
    
    // Special handling for dash_ tables
    if (tableName.startsWith('dash_')) {
      console.log(`[VERCEL] Handling dash table query: ${tableName}`);
      
      try {
        // Try to query the table directly
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(100);
        
        if (error) {
          console.error(`[VERCEL] Error querying ${tableName}:`, error);
          // Return empty array instead of throwing to prevent API failure
          return [];
        }
        
        console.log(`[VERCEL] ${tableName} query result:`, data?.length, 'records');
        return data || [];
      } catch (tableError) {
        console.error(`[VERCEL] Table ${tableName} query failed:`, tableError);
        return [];
      }
    }
    
    // Handle COUNT queries for dash tables
    if (query.includes('COUNT(*)')) {
      const countMatch = query.match(/FROM\s+(?:public\.)?(\w+)/i);
      if (countMatch) {
        const tableName = countMatch[1];
        console.log(`[VERCEL] Executing COUNT query for table: ${tableName}`);
        
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.error(`[VERCEL] COUNT ${tableName} query error:`, error);
            return [{ count: 0 }];
          }
          
          console.log(`[VERCEL] COUNT result for ${tableName}:`, count);
          return [{ count: count || 0 }];
        } catch (countError) {
          console.error(`[VERCEL] COUNT query failed:`, countError);
          return [{ count: 0 }];
        }
      }
    }
    
    // For unrecognized queries, return empty array to prevent API failure
    console.log('[VERCEL] Unhandled query pattern, returning empty array');
    return [];
    
  } catch (error) {
    console.error('[VERCEL] Error in handleDirectQuery:', error);
    // Return empty array instead of throwing to prevent API failure
    return [];
  }
}

module.exports = { executeSupabaseQuery };