# Configuração do Vercel para NGX Métricas Clientes

## Problema Identificado

Os dados do Supabase não estão aparecendo após o deploy no Vercel porque as variáveis de ambiente não estão configuradas corretamente no painel do Vercel.

## Solução

### 1. Configurar Variáveis de Ambiente no Vercel

Acesse o painel do Vercel e configure as seguintes variáveis de ambiente para **todos os ambientes** (Production, Preview, Development):

```
SUPABASE_URL=https://eoxlbkdsilnaxqpmuqfb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveGxia2RzaWxuYXhxcG11cWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjcyNTMsImV4cCI6MjA3NjgwMzI1M30.NmTTGiGn1uMAdEtwnOJ6KGgS7ZR_abZX2etOKCOrWRE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveGxia2RzaWxuYXhxcG11cWZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNzI1MywiZXhwIjoyMDc2ODAzMjUzfQ.8A1vkYn-wj1HvlaulrKMzhK98W-4CAqo33AKCpCTyZU
SUPABASE_PROJECT_REF=eoxlbkdsilnaxqpmuqfb
NODE_ENV=production
```

### 2. Como Configurar no Painel do Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Vá para o projeto NGX Métricas Clientes
3. Clique em **Settings**
4. Clique em **Environment Variables**
5. Adicione cada variável acima para todos os ambientes:
   - **Production**: ✅
   - **Preview**: ✅ 
   - **Development**: ✅

### 3. Redeploy Necessário

Após configurar as variáveis de ambiente, é **obrigatório** fazer um redeploy:

1. Vá para a aba **Deployments**
2. Clique nos três pontos (...) do último deploy
3. Clique em **Redeploy**
4. Ou faça um novo commit e push para triggerar um novo deploy

### 4. Verificação

Após o redeploy, verifique:

1. Acesse a URL do projeto no Vercel
2. Verifique se os clientes aparecem na lista
3. Verifique os logs da função serverless em **Functions** > **View Function Logs**

### 5. Arquivos Modificados

- `vercel.json`: Configuração adequada para funções serverless
- `api/mcp-integration.ts`: Versão específica para Vercel que carrega variáveis de ambiente corretamente
- `api/index.ts`: Atualizado para usar a versão correta do mcp-integration

### 6. Logs de Debug

A função serverless agora inclui logs detalhados que mostrarão:
- Se as variáveis de ambiente estão sendo carregadas
- Detalhes da execução das queries
- Erros específicos se houver

Verifique os logs em **Vercel Dashboard > Functions > View Function Logs** para diagnosticar problemas.