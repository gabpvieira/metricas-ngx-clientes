import { executeSupabaseQuery } from './mcp-integration.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const testQuery = "SELECT * FROM configuracoes LIMIT 5";
    const result = await executeSupabaseQuery(testQuery);
    
    res.status(200).json({
      success: true,
      message: 'Teste de conexão com Supabase realizado com sucesso',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar conexão com Supabase',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
}