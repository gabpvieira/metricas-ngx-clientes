import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { executeSupabaseQuery } from "./mcp-integration";

export async function registerRoutes(app: Express): Promise<Server> {
  // Supabase MCP integration routes
  app.post('/api/supabase/execute-query', async (req, res) => {
    try {
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

      res.json(result);
    } catch (error) {
      console.error('Error executing Supabase query:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get('/api/supabase/tables/:project_ref', async (req, res) => {
    try {
      const { project_ref } = req.params;
      
      // For now, return known tables
      const knownTables = [
        'dash_sa_veiculos_rows', 
        'dash_sa_veiculos_vendas',
        'dash_ngx_veiculos_rows',
        'dash_ngx_veiculos_vendas'
      ];
      
      res.json({ 
        success: true, 
        data: knownTables 
      });
    } catch (error) {
      console.error('Error listing tables:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
