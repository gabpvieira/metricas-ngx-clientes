import { ClienteInfo } from '../../../shared/schema';
import { supabaseService } from '../services/supabaseService';

// Interfaces para o serviço de clientes
export interface CreateClientRequest {
  nome: string;
  slug: string;
  tipo_negocio: 'concessionaria' | 'loja_carros' | 'multimarca' | 'mensagens' | 'vendas';
  dashboard_type?: 'leads' | 'vendas';
  logo?: string;
  meta_mensal_conversas?: number;
  meta_mensal_investimento?: number;
  meta_mensal_vendas?: number;
  meta_roi?: number;
}

export interface ClientServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  audit_log?: AuditLog;
}

export interface AuditLog {
  action: string;
  client_slug: string;
  timestamp: Date;
  details: any;
  success: boolean;
  error?: string;
}

export class ClientService {
  private auditLogs: AuditLog[] = [];

  private logAction(action: string, clientSlug: string, details: any, success: boolean, error?: string) {
    const auditLog: AuditLog = {
      action,
      client_slug: clientSlug,
      timestamp: new Date(),
      details,
      success,
      error
    };
    this.auditLogs.push(auditLog);
    console.log(`[${auditLog.timestamp.toISOString()}] ${action} for ${clientSlug}: ${success ? 'SUCCESS' : 'ERROR'}`, details);
  }

  /**
   * Cria as tabelas necessárias para um novo cliente no Supabase
   */
  private async createClientTables(clientSlug: string, dashboardType: 'leads' | 'vendas' = 'leads'): Promise<ClientServiceResponse> {
    try {
      const result = await supabaseService.createClientTables(clientSlug, dashboardType);
      
      this.logAction('create_tables', clientSlug, {
        action: 'create_client_tables',
        dashboard_type: dashboardType,
        tables: result.data?.tables_created || []
      }, result.success, result.error);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.logAction('create_tables', clientSlug, {
        action: 'create_client_tables',
        dashboard_type: dashboardType,
        error: errorMessage
      }, false, errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Remove as tabelas de um cliente do Supabase
   */
  private async deleteClientTables(clientSlug: string): Promise<ClientServiceResponse> {
    try {
      const result = await supabaseService.deleteClientTables(clientSlug);
      
      this.logAction('delete_tables', clientSlug, {
        action: 'delete_client_tables',
        tables: result.data?.tables_deleted || []
      }, result.success, result.error);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.logAction('delete_tables', clientSlug, {
        action: 'delete_client_tables',
        error: errorMessage
      }, false, errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Cria um novo cliente com suas tabelas e configurações
   */
  async createClient(request: CreateClientRequest): Promise<ClientServiceResponse<ClienteInfo>> {
    this.logAction('create_client_start', request.slug, { nome: request.nome }, true);

    try {
      // 1. Validar dados de entrada
      if (!request.nome || !request.slug || !request.tipo_negocio) {
        throw new Error('Dados obrigatórios não fornecidos');
      }

      // 2. Verificar se cliente já existe na tabela de configurações
      const existsResult = await supabaseService.checkClientExists(request.slug);
      if (!existsResult.success) {
        throw new Error(`Erro ao verificar cliente existente: ${existsResult.error}`);
      }
      
      if (existsResult.exists) {
        throw new Error(`Cliente com slug '${request.slug}' já existe`);
      }

      // 3. Determinar tipo de dashboard - vendas sempre usa híbrido (leads + vendas)
      const dashboardType = request.dashboard_type || (request.tipo_negocio === 'vendas' ? 'vendas' : 'leads');

      // 4. Criar registro na tabela de configurações
      const configResult = await supabaseService.createClientConfig({
        slug: request.slug,
        nome: request.nome,
        tipo_negocio: request.tipo_negocio,
        dashboard_type: dashboardType,
        logo_url: request.logo || '',
        meta_mensal_conversas: request.meta_mensal_conversas || 0,
        meta_mensal_investimento: request.meta_mensal_investimento || 0,
        meta_mensal_vendas: request.meta_mensal_vendas || 0,
        meta_roi: request.meta_roi || 0
      });

      if (!configResult.success) {
        throw new Error(`Falha ao criar configuração: ${configResult.error}`);
      }

      // 5. Criar tabelas no Supabase
      const tablesResult = await this.createClientTables(request.slug, dashboardType);
      if (!tablesResult.success) {
        // Se falhar, remover configuração criada
        await supabaseService.deleteClientConfig(request.slug);
        throw new Error(`Falha ao criar tabelas: ${tablesResult.error}`);
      }

      // 6. Criar registro do cliente (manter compatibilidade com localStorage)
      const cliente: ClienteInfo = {
        nome: request.nome,
        slug: request.slug,
        tipo_negocio: request.tipo_negocio,
        logo: request.logo || '',
        ativo: true,
        meta_mensal_conversas: request.meta_mensal_conversas || 0,
        meta_mensal_investimento: request.meta_mensal_investimento || 0,
        meta_mensal_vendas: request.meta_mensal_vendas || 0,
        meta_roi: request.meta_roi || 0,
        data_criacao: new Date()
      };

      // Salvar no localStorage para compatibilidade
      const clients = this.getStoredClients();
      clients.push(cliente);
      localStorage.setItem('ngx_clients', JSON.stringify(clients));

      this.logAction('create_client_success', request.slug, { 
        cliente,
        config_result: configResult.data,
        tables_result: tablesResult.data 
      }, true);

      return {
        success: true,
        data: cliente,
        audit_log: this.auditLogs[this.auditLogs.length - 1]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.logAction('create_client_error', request.slug, { 
        error: errorMessage 
      }, false, errorMessage);

      return {
        success: false,
        error: errorMessage,
        audit_log: this.auditLogs[this.auditLogs.length - 1]
      };
    }
  }

  /**
   * Remove um cliente e todas suas tabelas associadas
   */
  async deleteClient(slug: string): Promise<ClientServiceResponse> {
    this.logAction('delete_client_start', slug, {}, true);

    try {
      // 1. Verificar se cliente existe na tabela de configurações
      const existsResult = await supabaseService.checkClientExists(slug);
      if (!existsResult.success) {
        throw new Error(`Erro ao verificar cliente: ${existsResult.error}`);
      }
      
      if (!existsResult.exists) {
        throw new Error(`Cliente com slug '${slug}' não encontrado`);
      }

      // 2. Remover tabelas do Supabase
      const tablesResult = await this.deleteClientTables(slug);
      if (!tablesResult.success) {
        console.warn(`Aviso: Falha ao remover tabelas: ${tablesResult.error}`);
        // Continuar mesmo com falha nas tabelas para permitir limpeza
      }

      // 3. Remover da tabela de configurações
      const configResult = await supabaseService.deleteClientConfig(slug);
      if (!configResult.success) {
        console.warn(`Aviso: Falha ao remover configuração: ${configResult.error}`);
      }

      // 4. Remover registro do localStorage (compatibilidade)
      const clients = this.getStoredClients();
      const clientIndex = clients.findIndex(client => client.slug === slug);
      if (clientIndex !== -1) {
        clients.splice(clientIndex, 1);
        localStorage.setItem('ngx_clients', JSON.stringify(clients));
      }

      this.logAction('delete_client_success', slug, { 
        tables_result: tablesResult.data,
        config_result: configResult.data
      }, true);

      return {
        success: true,
        data: { deleted_client: slug },
        audit_log: this.auditLogs[this.auditLogs.length - 1]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.logAction('delete_client_error', slug, { 
        error: errorMessage 
      }, false, errorMessage);

      return {
        success: false,
        error: errorMessage,
        audit_log: this.auditLogs[this.auditLogs.length - 1]
      };
    }
  }

  /**
   * Sincroniza localStorage com clientes válidos da API
   */
  private syncLocalStorageWithAPI(apiClients: ClienteInfo[]): void {
    try {
      // Mantém apenas clientes que existem na API
      const validSlugs = apiClients.map(client => client.slug);
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const storedClients = JSON.parse(stored) as ClienteInfo[];
        const validStoredClients = storedClients.filter(client => 
          validSlugs.includes(client.slug)
        );
        
        // Atualiza localStorage apenas com clientes válidos
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validStoredClients));
      }
    } catch (error) {
      console.error('Erro ao sincronizar localStorage:', error);
      // Em caso de erro, limpa completamente o localStorage
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Lista todos os clientes cadastrados
   */
  async listClients(): Promise<ClientServiceResponse<ClienteInfo[]>> {
    try {
      // Busca clientes da tabela de configurações (fonte principal)
      const configsResult = await supabaseService.listClientConfigs();
      if (!configsResult.success) {
        throw new Error(`Erro ao buscar configurações: ${configsResult.error}`);
      }

      const allClients: ClienteInfo[] = [];

      // Converte configurações para ClienteInfo
      if (configsResult.data) {
        for (const config of configsResult.data) {
          allClients.push({
            id: config.id,
            nome: config.nome,
            slug: config.slug,
            tipo_negocio: config.tipo_negocio,
            logo: config.logo_url || '',
            ativo: config.ativo,
            meta_mensal_conversas: config.meta_mensal_conversas || 0,
            meta_mensal_investimento: config.meta_mensal_investimento || 0,
            meta_mensal_vendas: config.meta_mensal_vendas || 0,
            meta_roi: config.meta_roi || 0,
            data_criacao: new Date(config.created_at)
          });
        }
      }

      // Limpa localStorage para manter apenas clientes válidos da API
      this.syncLocalStorageWithAPI(allClients);
      
      return {
        success: true,
        data: allClients
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Detecta clientes existentes baseado nas tabelas do Supabase
   */
  private async detectExistingClients(): Promise<ClienteInfo[]> {
    try {
      const tablesResult = await supabaseService.listTables();
      if (!tablesResult.success || !tablesResult.data) {
        return [];
      }

      const tables = tablesResult.data;
      const clientSlugs = new Set<string>();

      // Procura por tabelas que seguem o padrão dash_<slug>_rows
      for (const table of tables) {
        if (table.startsWith('dash_') && table.endsWith('_rows')) {
          const slug = table.replace('dash_', '').replace('_rows', '');
          clientSlugs.add(slug);
        }
      }

      const existingClients: ClienteInfo[] = [];

      for (const slug of clientSlugs) {
        // Mapeia slugs conhecidos para informações específicas
        if (slug === 'sa_veiculos') {
          existingClients.push({
            id: 'sa-veiculos-existing',
            nome: 'SA Veículos',
            slug: 'saveiculos-dash', // Slug usado no dashboard
            tipo_negocio: 'concessionaria',
            logo: '🚗',
            ativo: true,
            data_criacao: new Date('2024-01-01'), // Data estimada
            meta: {
              objetivo_conversas: 100,
              meta_cpl: 50,
              meta_ctr: 2.5,
              meta_roi: 300
            }
          });
        } else {
          // Para outros clientes detectados, cria uma entrada genérica
          existingClients.push({
            id: `${slug}-existing`,
            nome: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' '),
            slug: slug.replace(/_/g, '-'),
            tipo_negocio: 'loja_carros',
            logo: '🏢',
            ativo: true,
            data_criacao: new Date(),
            meta: {
              objetivo_conversas: 50,
              meta_cpl: 30,
              meta_ctr: 2.0
            }
          });
        }
      }

      return existingClients;
    } catch (error) {
      console.error('Erro ao detectar clientes existentes:', error);
      return [];
    }
  }

  /**
   * Atualiza o status ativo/inativo de um cliente
   */
  async toggleClientStatus(slug: string): Promise<ClientServiceResponse<ClienteInfo>> {
    try {
      const clients = this.getStoredClients();
      const clientIndex = clients.findIndex(client => client.slug === slug);
      
      if (clientIndex === -1) {
        throw new Error(`Cliente com slug '${slug}' não encontrado`);
      }

      clients[clientIndex].ativo = !clients[clientIndex].ativo;
      localStorage.setItem('ngx_clients', JSON.stringify(clients));

      this.logAction('toggle_client_status', slug, { 
        new_status: clients[clientIndex].ativo 
      }, true);

      return {
        success: true,
        data: clients[clientIndex],
        audit_log: this.auditLogs[this.auditLogs.length - 1]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.logAction('toggle_client_status_error', slug, { 
        error: errorMessage 
      }, false, errorMessage);

      return {
        success: false,
        error: errorMessage,
        audit_log: this.auditLogs[this.auditLogs.length - 1]
      };
    }
  }

  /**
   * Obtém clientes armazenados no localStorage
   */
  private getStoredClients(): ClienteInfo[] {
    try {
      const stored = localStorage.getItem('ngx_clients');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Obtém logs de auditoria
   */
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  /**
   * Limpa logs de auditoria
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }
}

export const clientService = new ClientService();