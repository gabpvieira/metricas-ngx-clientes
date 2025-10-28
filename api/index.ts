import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeSupabaseQuery } from '../server/mcp-integration';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    // Route: POST /api/supabase/execute-query
    if (method === 'POST' && path === '/supabase/execute-query') {
      const { project_ref, query } = req.body;
      
      if (!project_ref || !query) {
        return res.status(400).json({ 
          success: false, 
          error: 'project_ref and query are required' 
        });
      }

      console.log(`Executing query for project ${project_ref}:`, query);
      
      // Execute the query using MCP Supabase integration
      const queryResult = await executeSupabaseQuery(project_ref, query);
      
      const result = {
        success: true,
        data: queryResult
      };

      return res.json(result);
    }

    // Route: GET /api/supabase/tables/:project_ref
    if (method === 'GET' && path.startsWith('/supabase/tables/')) {
      const project_ref = path.replace('/supabase/tables/', '');
      
      // For now, return known tables
      const knownTables = [
        'dash_sa_veiculos_rows', 
        'dash_sa_veiculos_vendas',
        'dash_ngx_veiculos_rows',
        'dash_ngx_veiculos_vendas',
        'dash_gabriel_seminovos_rows',
        'dash_gabriel_seminovos_vendas'
      ];
      
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