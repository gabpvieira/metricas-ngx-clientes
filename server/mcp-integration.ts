import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
const envFile = isProduction ? '.env.production' : '.env.local';

console.log(`[ENV] Loading environment from: ${envFile} (NODE_ENV: ${process.env.NODE_ENV})`);
dotenv.config({ path: envFile });

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eoxlbkdsilnaxqpmuqfb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveGxia2RzaWxuYXhxcG11cWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjcyNTMsImV4cCI6MjA3NjgwMzI1M30.NmTTGiGn1uMAdEtwnOJ6KGgS7ZR_abZX2etOKCOrWRE";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'eoxlbkdsilnaxqpmuqfb';

// Create Supabase client with service role for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

// MCP Supabase integration functions
interface MCPSupabaseResponse {
  success: boolean;
  data?: any;
  error?: string;
}

async function executeMCPQuery(projectRef: string, query: string): Promise<MCPSupabaseResponse> {
  try {
    console.log(`[MCP] Executing query on project ${projectRef}:`, query);
    
    // Here we would normally call the MCP Supabase functions
    // For now, we'll use direct Supabase client calls
    
    // Parse the query to determine the operation
    const queryLower = query.toLowerCase().trim();
    
    if (queryLower.startsWith('select')) {
      return await handleSelectQuery(query);
    } else if (queryLower.startsWith('insert')) {
      return await handleInsertQuery(query);
    } else if (queryLower.startsWith('update')) {
      return await handleUpdateQuery(query);
    } else if (queryLower.startsWith('delete')) {
      return await handleDeleteQuery(query);
    } else {
      return {
        success: false,
        error: 'Unsupported query type'
      };
    }
  } catch (error) {
    console.error('[MCP] Query execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Query handler functions
async function handleSelectQuery(query: string): Promise<MCPSupabaseResponse> {
  try {
    // Extract table name from query
    const tableMatch = query.match(/FROM\s+(?:public\.)?(\w+)/i);
    if (!tableMatch) {
      return { success: false, error: 'Could not extract table name from query' };
    }
    
    const tableName = tableMatch[1];
    console.log(`[MCP] Executing SELECT on table: ${tableName}`);
    
    // Handle specific table queries
    if (tableName === 'configuracoes') {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    }
    
    // Handle dashboard tables
    if (tableName.startsWith('dash_')) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return { success: true, data: data || [] };
    }
    
    // Generic table query
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(100);
    
    if (error) throw error;
    return { success: true, data: data || [] };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'SELECT query failed' 
    };
  }
}

async function handleInsertQuery(query: string): Promise<MCPSupabaseResponse> {
  // For now, return not implemented
  return { success: false, error: 'INSERT queries not implemented yet' };
}

async function handleUpdateQuery(query: string): Promise<MCPSupabaseResponse> {
  // For now, return not implemented
  return { success: false, error: 'UPDATE queries not implemented yet' };
}

async function handleDeleteQuery(query: string): Promise<MCPSupabaseResponse> {
  // For now, return not implemented
  return { success: false, error: 'DELETE queries not implemented yet' };
}

export async function executeSupabaseQuery(projectRef: string, query: string): Promise<any> {
  try {
    console.log('Executing Supabase query:', query);
    
    // Check environment - only use MCP in development
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('[PRODUCTION] Using direct Supabase client');
      return await handleDirectQuery(query);
    }
    
    // Development mode - try MCP first, then fallback
    console.log('[DEVELOPMENT] Trying MCP approach first');
    const mcpResult = await executeMCPQuery(projectRef, query);
    
    if (mcpResult.success) {
      console.log('[MCP] Query successful:', mcpResult.data);
      return mcpResult.data;
    }
    
    console.log('[MCP] Query failed, using direct client fallback:', mcpResult.error);
    return await handleDirectQuery(query);
    
  } catch (error) {
    console.error('Error executing Supabase query:', error);
    
    // Final fallback to direct queries
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
    // Try to match with or without 'public.' prefix
    const tableMatch = query.match(/FROM\s+(?:public\.)?(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      console.log(`Executing query for dash table: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('data_registro', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error(`Direct ${tableName} query error:`, error);
        throw error;
      }
      
      console.log(`Query result for ${tableName}:`, data?.length, 'records');
      return data || [];
    }
  }
  
  // Handle vendas table queries
  if (query.includes('dash_') && query.includes('_vendas')) {
    // Try to match with or without 'public.' prefix
    const tableMatch = query.match(/FROM\s+(?:public\.)?(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      console.log(`Executing query for vendas table: ${tableName}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('data_venda', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error(`Direct ${tableName} query error:`, error);
        throw error;
      }
      
      console.log(`Query result for ${tableName}:`, data?.length, 'records');
      return data || [];
    }
  }
  
  // Handle COUNT queries for dash tables
  if (query.includes('COUNT(*)') && query.includes('dash_')) {
    const tableMatch = query.match(/FROM\s+(?:public\.)?(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      console.log(`Executing COUNT query for table: ${tableName}`);
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Direct COUNT ${tableName} query error:`, error);
        throw error;
      }
      
      console.log(`COUNT result for ${tableName}:`, count);
      return [{ count: count || 0 }];
    }
  }
  
  // Default empty response for unhandled queries
  console.warn('Unhandled query pattern:', query);
  return [];
}