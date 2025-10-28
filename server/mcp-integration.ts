import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://eoxlbkdsilnaxqpmuqfb.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveGxia2RzaWxuYXhxcG11cWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjcyNTMsImV4cCI6MjA3NjgwMzI1M30.NmTTGiGn1uMAdEtwnOJ6KGgS7ZR_abZX2etOKCOrWRE";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function executeSupabaseQuery(projectRef: string, query: string): Promise<any> {
  try {
    console.log('Executing Supabase query:', query);
    
    // Execute raw SQL query using Supabase RPC
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query 
    });

    if (error) {
      console.error('Supabase query error:', error);
      
      // If RPC doesn't exist, try direct table queries for known patterns
      if (error.message?.includes('function execute_sql') || error.code === 'PGRST202') {
        return await handleDirectQuery(query);
      }
      
      throw error;
    }

    console.log('Supabase query result:', data);
    return data;
  } catch (error) {
    console.error('Error executing Supabase query:', error);
    
    // Fallback to direct queries for known patterns
    try {
      return await handleDirectQuery(query);
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      throw error;
    }
  }
}

async function handleDirectQuery(query: string): Promise<any> {
  console.log('Attempting direct query for:', query);
  
  // Handle configuracoes table queries
  if (query.includes('SELECT * FROM public.configuracoes')) {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Direct configuracoes query error:', error);
      throw error;
    }
    
    return data || [];
  }
  
  // Handle table listing queries
  if (query.includes('information_schema.tables')) {
    // Return known tables for now
    return [
      { table_name: 'dash_sa_veiculos_rows' },
      { table_name: 'dash_sa_veiculos_vendas' },
      { table_name: 'dash_gabriel_seminovos_rows' },
      { table_name: 'dash_gabriel_seminovos_vendas' },
      { table_name: 'configuracoes' }
    ];
  }
  
  // Handle dashboard data queries
  if (query.includes('dash_') && query.includes('_rows')) {
    const tableMatch = query.match(/FROM\s+public\.(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('data_registro', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error(`Direct ${tableName} query error:`, error);
        throw error;
      }
      
      return data || [];
    }
  }
  
  // Handle vendas table queries
  if (query.includes('dash_') && query.includes('_vendas')) {
    const tableMatch = query.match(/FROM\s+public\.(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('data_venda', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error(`Direct ${tableName} query error:`, error);
        throw error;
      }
      
      return data || [];
    }
  }
  
  // Default empty response for unhandled queries
  console.warn('Unhandled query pattern:', query);
  return [];
}