// Supabase service using MCP integration
export class SupabaseService {
  private projectRef = 'eoxlbkdsilnaxqpmuqfb'; // Your project ref

  async executeQuery(query: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Executing query:', query);
      
      // Use the MCP Supabase integration to execute the query
      const response = await fetch('/api/supabase/execute-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_ref: this.projectRef,
          query: query
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw API response:', result);
      
      // A API retorna {success: boolean, data: any[], error?: string}
      // Vamos retornar isso diretamente
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async listTables(): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      const response = await fetch(`/api/supabase/tables/${this.projectRef}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error listing tables:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private generateMockData(baseTableName: string, dashboardType: 'leads' | 'vendas') {
    const currentDate = new Date();
    const mockData = [];

    if (dashboardType === 'leads') {
      // Generate mock data for leads/conversations dashboard
      for (let i = 0; i < 30; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        
        mockData.push({
          data_registro: date.toISOString().split('T')[0],
          nome_anuncio: `Anúncio ${i + 1}`,
          link_criativo: `https://example.com/creative-${i + 1}`,
          valor_gasto: (Math.random() * 500 + 100).toFixed(2),
          conversas_iniciadas: Math.floor(Math.random() * 50) + 10,
          custo_por_conversa: (Math.random() * 15 + 5).toFixed(2),
          impressoes: Math.floor(Math.random() * 10000) + 1000,
          alcance: Math.floor(Math.random() * 8000) + 800,
          cliques_todos: Math.floor(Math.random() * 500) + 50,
          cliques_link: Math.floor(Math.random() * 300) + 30,
          ctr_todos: (Math.random() * 5 + 1).toFixed(2),
          ctr_link: (Math.random() * 3 + 0.5).toFixed(2),
          cpm: (Math.random() * 20 + 5).toFixed(2),
          cpc_todos: (Math.random() * 5 + 1).toFixed(2),
          custo_clique_link: (Math.random() * 8 + 2).toFixed(2),
          frequencia: (Math.random() * 3 + 1).toFixed(2),
          engajamento_publicacao: Math.floor(Math.random() * 200) + 20,
          visualizacoes_video: Math.floor(Math.random() * 1000) + 100,
          custo_visualizacao_video: (Math.random() * 2 + 0.5).toFixed(2)
        });
      }
    } else {
      // Generate mock data for sales
      for (let i = 0; i < 15; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i * 2);
        
        mockData.push({
          anuncio_id: `ad_${i + 1}`,
          anuncio_titulo: `Anúncio Venda ${i + 1}`,
          valor_veiculo: (Math.random() * 50000 + 10000).toFixed(2),
          data_venda: date.toISOString()
        });
      }
    }

    return mockData;
  }

  /**
   * Cria tabelas híbridas (leads + vendas) com base no template da SA Veículos
   */
  async createClientTables(clientSlug: string, dashboardType: 'leads' | 'vendas' = 'leads'): Promise<{ success: boolean; data?: any; error?: string }> {
    const baseTableName = clientSlug.replace('-dash', '');
    const mainTableName = `dash_${baseTableName}_rows`;
    const vendasTableName = `dash_${baseTableName}_vendas`;

    try {
      // SQL para criar tabela principal
      const createMainTableSQL = `
        CREATE TABLE IF NOT EXISTS public.${mainTableName} (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          data_registro date NOT NULL,
          nome_anuncio text NOT NULL,
          link_criativo text NOT NULL,
          valor_gasto numeric NOT NULL,
          conversas_iniciadas integer NOT NULL,
          custo_por_conversa numeric NOT NULL,
          impressoes integer NOT NULL,
          alcance integer NOT NULL,
          cliques_todos integer NOT NULL,
          cliques_link integer NOT NULL,
          ctr_todos numeric NOT NULL,
          ctr_link numeric NOT NULL,
          cpm numeric NOT NULL,
          cpc_todos numeric NOT NULL,
          custo_clique_link numeric NOT NULL,
          frequencia numeric NOT NULL,
          engajamento_publicacao integer NOT NULL,
          visualizacoes_video integer NOT NULL,
          custo_visualizacao_video numeric NOT NULL,
          created_at timestamp with time zone DEFAULT now() NOT NULL
        );

        CREATE INDEX IF NOT EXISTS ${mainTableName}_data_registro_idx ON public.${mainTableName} (data_registro);
        CREATE INDEX IF NOT EXISTS ${mainTableName}_created_at_idx ON public.${mainTableName} (created_at);

        ALTER TABLE public.${mainTableName} ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "${mainTableName}_select_anon" ON public.${mainTableName}
          FOR SELECT TO anon USING (true);
        
        CREATE POLICY "${mainTableName}_select_authenticated" ON public.${mainTableName}
          FOR SELECT TO authenticated USING (true);
      `;

      // SQL para criar tabela de vendas
      const createVendasTableSQL = `
        CREATE TABLE IF NOT EXISTS public.${vendasTableName} (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          anuncio_id text NOT NULL,
          anuncio_titulo text NOT NULL,
          valor_veiculo numeric(12,2) NOT NULL,
          data_venda timestamp with time zone DEFAULT now(),
          cliente_slug text DEFAULT '${clientSlug}',
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_${vendasTableName}_anuncio_id ON public.${vendasTableName} (anuncio_id);
        CREATE INDEX IF NOT EXISTS idx_${vendasTableName}_cliente_slug ON public.${vendasTableName} (cliente_slug);
        CREATE INDEX IF NOT EXISTS idx_${vendasTableName}_data_venda ON public.${vendasTableName} (data_venda);

        ALTER TABLE public.${vendasTableName} ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "${vendasTableName}_select_anon" ON public.${vendasTableName}
          FOR SELECT TO public USING (true);
        
        CREATE POLICY "${vendasTableName}_select_authenticated" ON public.${vendasTableName}
          FOR SELECT TO public USING (role() = 'authenticated');

        CREATE POLICY "${vendasTableName}_insert_authenticated" ON public.${vendasTableName}
          FOR INSERT TO public WITH CHECK (role() = 'authenticated' OR role() = 'anon');
      `;

      // Executar criação da tabela principal
      const mainTableResult = await this.executeQuery(createMainTableSQL);
      if (!mainTableResult.success) {
        throw new Error(`Erro ao criar tabela principal: ${mainTableResult.error}`);
      }

      // Executar criação da tabela de vendas
      const vendasTableResult = await this.executeQuery(createVendasTableSQL);
      if (!vendasTableResult.success) {
        throw new Error(`Erro ao criar tabela de vendas: ${vendasTableResult.error}`);
      }

      // Gerar e inserir dados mock
      const mockMainData = this.generateMockData(baseTableName, 'leads');
      const mockVendasData = this.generateMockData(baseTableName, 'vendas');

      // Inserir dados na tabela principal
      for (const row of mockMainData) {
        const insertQuery = `
          INSERT INTO public.${mainTableName} (
            data_registro, nome_anuncio, link_criativo, valor_gasto, conversas_iniciadas,
            custo_por_conversa, impressoes, alcance, cliques_todos, cliques_link,
            ctr_todos, ctr_link, cpm, cpc_todos, custo_clique_link, frequencia,
            engajamento_publicacao, visualizacoes_video, custo_visualizacao_video
          ) VALUES (
            '${row.data_registro}', '${row.nome_anuncio}', '${row.link_criativo}',
            ${row.valor_gasto}, ${row.conversas_iniciadas}, ${row.custo_por_conversa},
            ${row.impressoes}, ${row.alcance}, ${row.cliques_todos}, ${row.cliques_link},
            ${row.ctr_todos}, ${row.ctr_link}, ${row.cpm}, ${row.cpc_todos},
            ${row.custo_clique_link}, ${row.frequencia}, ${row.engajamento_publicacao},
            ${row.visualizacoes_video}, ${row.custo_visualizacao_video}
          );
        `;
        await this.executeQuery(insertQuery);
      }

      // Inserir dados na tabela de vendas
      for (const row of mockVendasData) {
        const insertQuery = `
          INSERT INTO public.${vendasTableName} (
            anuncio_id, anuncio_titulo, valor_veiculo, data_venda
          ) VALUES (
            '${row.anuncio_id}', '${row.anuncio_titulo}', ${row.valor_veiculo}, '${row.data_venda}'
          );
        `;
        await this.executeQuery(insertQuery);
      }

      return {
        success: true,
        data: {
          tables_created: [mainTableName, vendasTableName],
          main_table: mainTableResult.data,
          vendas_table: vendasTableResult.data,
          mock_data_inserted: {
            main_rows: mockMainData.length,
            vendas_rows: mockVendasData.length
          }
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove as tabelas de um cliente
   */
  async deleteClientTables(clientSlug: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const baseTableName = clientSlug.replace('-dash', '');
    const mainTableName = `dash_${baseTableName}_rows`;
    const vendasTableName = `dash_${baseTableName}_vendas`;

    try {
      // SQL para remover tabelas
      const dropTablesSQL = `
        DROP TABLE IF EXISTS public.${vendasTableName} CASCADE;
        DROP TABLE IF EXISTS public.${mainTableName} CASCADE;
      `;

      const result = await this.executeQuery(dropTablesSQL);
      if (!result.success) {
        throw new Error(`Erro ao remover tabelas: ${result.error}`);
      }

      return {
        success: true,
        data: {
          tables_deleted: [mainTableName, vendasTableName],
          result: result.data
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica se as tabelas de um cliente existem
   */
  async checkClientTablesExist(clientSlug: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const baseTableName = clientSlug.replace('-dash', '');
    const mainTableName = `dash_${baseTableName}_rows`;
    const vendasTableName = `dash_${baseTableName}_vendas`;

    try {
      const checkSQL = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('${mainTableName}', '${vendasTableName}');
      `;

      const result = await this.executeQuery(checkSQL);
      if (!result.success) {
        throw new Error(`Erro ao verificar tabelas: ${result.error}`);
      }

      return {
        success: true,
        data: {
          main_table_exists: false, // TODO: Parse result to check actual existence
          vendas_table_exists: false,
          query_result: result.data
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica se um cliente existe na tabela de configurações
   */
  async checkClientExists(slug: string): Promise<{ success: boolean; exists?: boolean; data?: any; error?: string }> {
    try {
      const checkSQL = `
        SELECT * FROM public.configuracoes 
        WHERE slug = '${slug}' AND ativo = true;
      `;

      const result = await this.executeQuery(checkSQL);
      if (!result.success) {
        throw new Error(`Erro ao verificar cliente: ${result.error}`);
      }

      return {
        success: true,
        exists: result.data && result.data.length > 0,
        data: result.data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria um registro na tabela de configurações
   */
  async createClientConfig(clientData: {
    slug: string;
    nome: string;
    tipo_negocio: string;
    dashboard_type: string;
    logo_url?: string;
    meta_mensal_conversas?: number;
    meta_mensal_investimento?: number;
    meta_mensal_vendas?: number;
    meta_roi?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const insertSQL = `
        INSERT INTO public.configuracoes (
          slug, nome, tipo_negocio, dashboard_type, logo_url,
          meta_mensal_conversas, meta_mensal_investimento, 
          meta_mensal_vendas, meta_roi
        ) VALUES (
          '${clientData.slug}',
          '${clientData.nome}',
          '${clientData.tipo_negocio}',
          '${clientData.dashboard_type}',
          '${clientData.logo_url || ''}',
          ${clientData.meta_mensal_conversas || 0},
          ${clientData.meta_mensal_investimento || 0},
          ${clientData.meta_mensal_vendas || 0},
          ${clientData.meta_roi || 0}
        );
      `;

      const result = await this.executeQuery(insertSQL);
      if (!result.success) {
        throw new Error(`Erro ao criar configuração: ${result.error}`);
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista todos os clientes da tabela de configurações
   */
  async listClientConfigs(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const selectSQL = `
        SELECT * FROM public.configuracoes 
        WHERE ativo = true 
        ORDER BY created_at DESC;
      `;

      const result = await this.executeQuery(selectSQL);
      console.log('listClientConfigs - executeQuery result:', result);
      if (!result.success) {
        throw new Error(`Erro ao listar configurações: ${result.error}`);
      }

      console.log('listClientConfigs - returning data:', result.data);
      return {
        success: true,
        data: result.data || []
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um cliente da tabela de configurações
   */
  async deleteClientConfig(slug: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const deleteSQL = `
        UPDATE public.configuracoes 
        SET ativo = false, updated_at = NOW()
        WHERE slug = '${slug}';
      `;

      const result = await this.executeQuery(deleteSQL);
      if (!result.success) {
        throw new Error(`Erro ao remover configuração: ${result.error}`);
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const supabaseService = new SupabaseService();