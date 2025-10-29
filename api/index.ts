const { VercelRequest, VercelResponse } = require('@vercel/node');
const { executeSupabaseQuery } = require('./mcp-integration');

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[VERCEL API] ${req.method} ${req.url}`);
  console.log(`[VERCEL API] Environment check:`, {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const path = url?.replace('/api', '') || '';
  
  console.log(`[VERCEL API] Processing path: ${path}`);

  try {
    // Route: POST /api/supabase/execute-query
    if (method === 'POST' && path === '/supabase/execute-query') {
      const { project_ref, query } = req.body;
      
      console.log(`[VERCEL API] Received execute-query request:`, { project_ref, query });
      
      if (!project_ref || !query) {
        console.log(`[VERCEL API] Missing required parameters`);
        return res.status(400).json({ 
          success: false, 
          error: 'project_ref and query are required' 
        });
      }

      console.log(`[VERCEL API] Executing query for project ${project_ref}:`, query);
      
      try {
        // Execute the query using MCP Supabase integration
        const queryResult = await executeSupabaseQuery(project_ref, query);
        
        console.log(`[VERCEL API] Query executed successfully, result length:`, Array.isArray(queryResult) ? queryResult.length : 'not array');
        
        const result = {
          success: true,
          data: queryResult
        };

        return res.json(result);
      } catch (queryError) {
        console.error(`[VERCEL API] Query execution failed:`, queryError);
        return res.status(500).json({
          success: false,
          error: queryError instanceof Error ? queryError.message : 'Query execution failed'
        });
      }
    }

    // Route: GET /api/supabase/tables/:project_ref
    if (method === 'GET' && path.startsWith('/supabase/tables/')) {
      const project_ref = path.replace('/supabase/tables/', '');
      
      console.log(`[VERCEL API] Getting tables for project: ${project_ref}`);
      
      // For now, return known tables
      const knownTables = [
        'dash_sa_veiculos_rows', 
        'dash_sa_veiculos_vendas',
        'dash_ngx_veiculos_rows',
        'dash_ngx_veiculos_vendas',
        'dash_gabriel_seminovos_rows',
        'dash_gabriel_seminovos_vendas'
      ];
      
      console.log(`[VERCEL API] Returning ${knownTables.length} known tables`);
      
      return res.json({
        success: true,
        data: knownTables
      });
    }

    // Route: GET /api/health
    if (method === 'GET' && path === '/health') {
      return res.json({ 
        success: true, 
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      });
    }

    // Default 404 for unmatched routes
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}