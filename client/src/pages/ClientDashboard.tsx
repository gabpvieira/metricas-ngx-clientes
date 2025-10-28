import { useState, useMemo, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";
import InsightsCard from "@/components/InsightsCard";

import EvolutionChart from "@/components/EvolutionChart";
import PerformanceChart from "@/components/PerformanceChart";
import AdsTable from "@/components/AdsTable";
import AddSaleDialog from "@/components/AddSaleDialog";

import { DollarSign, MessageSquare, Eye, Users, ShoppingCart, TrendingUp, Percent, Banknote, PiggyBank, Target } from "lucide-react";
import { mockClientes, calcularResumo, calcularResumoComVendasReais, gerarInsightsConsolidados } from "@/lib/mock-data";

import { fetchMetricasBySlug } from "@/lib/supabaseData";
import { calcularPeriodo } from "@/lib/dateUtils";
import { aggregateAdsByName } from "@/lib/adsAggregation";

export default function ClientDashboard() {
  console.log('🚀 ClientDashboard renderizado!');
  const [, params] = useRoute("/:slug");
  console.log('📍 Params recebidos:', params);
  const [period, setPeriod] = useState("30dias");
  const [resumo, setResumo] = useState<any>(null);

  //todo: remove mock functionality - get cliente from API
  const cliente = mockClientes.find(c => c.slug === params?.slug) || mockClientes[0];
  
  // Calcular datas do período automaticamente
  const { dataInicio, dataFim } = useMemo(() => {
    return calcularPeriodo(period);
  }, [period]);
  
  // Buscar métricas reais do Supabase por slug e período
  const { data: metricas = [], isLoading, error } = useQuery({
    queryKey: ["metricas", params?.slug, dataInicio, dataFim],
    queryFn: () => {
      console.log('🎯 React Query executando fetchMetricasBySlug com:', { slug: params?.slug, dataInicio, dataFim });
      return fetchMetricasBySlug(params?.slug, dataInicio, dataFim);
    },
    enabled: !!params?.slug, // Só executa se o slug existir
  });

  console.log('📊 Estado do React Query:', { 
    isLoading, 
    error: error?.message, 
    metricasLength: metricas.length,
    slug: params?.slug,
    enabled: !!params?.slug
  });
  
  // Calcular resumo com dados reais de vendas
  useEffect(() => {
    if (metricas.length > 0) {
      calcularResumoComVendasReais(metricas, cliente.tipo_negocio, params?.slug, dataInicio, dataFim)
        .then(setResumo)
        .catch(console.error);
    }
  }, [metricas, cliente.tipo_negocio, params?.slug, dataInicio, dataFim]);
  
  const insights = useMemo(() => {
    if (!resumo) return [];
    return gerarInsightsConsolidados(resumo, cliente?.tipo_negocio as 'mensagens' | 'vendas');
  }, [resumo, cliente?.tipo_negocio]);

  
  //todo: remove mock functionality - generate from real data
  const evolutionData = useMemo(() => {
    const groupedByDate = metricas.reduce((acc, m) => {
      const date = new Date(m.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) {
        acc[date] = { data: date, investimento: 0, conversas: 0 };
      }
      acc[date].investimento += parseFloat(m.valor_gasto);
      acc[date].conversas += m.conversas_iniciadas;
      return acc;
    }, {} as Record<string, { data: string; investimento: number; conversas: number }>);
    
    return Object.values(groupedByDate).sort((a, b) => {
      const [dayA, monthA] = a.data.split('/');
      const [dayB, monthB] = b.data.split('/');
      return new Date(2025, parseInt(monthA) - 1, parseInt(dayA)).getTime() - 
             new Date(2025, parseInt(monthB) - 1, parseInt(dayB)).getTime();
    });
  }, [metricas]);

  // Performance data usando dados agregados por nome de anúncio
  const performanceData = useMemo(() => {
    const aggregatedData = aggregateAdsByName(metricas);
    return aggregatedData
      .sort((a, b) => b.conversas_iniciadas - a.conversas_iniciadas)
      .slice(0, 5)
      .map(m => ({
        nome: m.nome_anuncio.length > 15 ? m.nome_anuncio.substring(0, 15) + '...' : m.nome_anuncio,
        conversas: m.conversas_iniciadas,
        gasto: parseFloat(m.valor_gasto.toString())
      }));
  }, [metricas]);

  if (isLoading || !resumo) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <div className="text-muted-foreground">Carregando métricas do Supabase…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <div className="text-red-600">Erro ao carregar métricas. Tente novamente.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        clientName={cliente.nome}
        logoUrl={cliente.logo_url}
        period={period}
        onPeriodChange={setPeriod}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Botões de ação */}
        <div className="flex justify-end gap-2">
          <AddSaleDialog metricas={metricas} clientSlug={params?.slug || ''} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <MetricCard
            title="INVESTIMENTO"
            value={`R$ ${resumo.investimento_total.toFixed(2)}`}
            subtitle="Total do período"
            icon={DollarSign}
          />
          
          {cliente.tipo_negocio === 'vendas' ? (
            <>
              <MetricCard
                title="FATURAMENTO"
                value={`R$ ${(resumo.receita_total || 0).toLocaleString('pt-BR')}`}
                subtitle={`${resumo.vendas_geradas || 0} veículos vendidos`}
                icon={Banknote}
              />
              <MetricCard
                title="LUCRO MÉDIO"
                value={`R$ ${((resumo.receita_total || 0) * 0.08).toLocaleString('pt-BR')}`}
                subtitle={`8% do faturamento total`}
                icon={PiggyBank}
              />
              <MetricCard
                title="CPL"
                value={`R$ ${resumo.conversas_iniciadas > 0 ? (resumo.investimento_total / resumo.conversas_iniciadas).toFixed(2) : '0.00'}`}
                subtitle={`${resumo.conversas_iniciadas} leads gerados`}
                icon={Target}
              />
              <MetricCard
                title="TAXA DE CONVERSÃO"
                value={`${resumo.conversas_iniciadas > 0 ? ((resumo.vendas_geradas || 0) / resumo.conversas_iniciadas * 100).toFixed(1) : 0}%`}
                subtitle={`${resumo.vendas_geradas || 0} de ${resumo.conversas_iniciadas} leads`}
                icon={Percent}
              />
              <MetricCard
                title="ROI (LUCRO)"
                value={`${resumo.investimento_total > 0 ? (((resumo.receita_total || 0) * 0.08 - resumo.investimento_total) / resumo.investimento_total * 100).toFixed(1) : 0}%`}
                subtitle={`Baseado no lucro de 8%`}
                icon={TrendingUp}
              />
            </>
          ) : (
            <>
              <MetricCard
                title="CONVERSAS"
                value={resumo.conversas_iniciadas}
                subtitle={`R$ ${resumo.custo_medio_conversa.toFixed(2)}/conv`}
                icon={MessageSquare}
              />
              <MetricCard
                title="VENDAS GERADAS"
                value={resumo.vendas_geradas || 0}
                subtitle={`${resumo.conversas_iniciadas > 0 ? ((resumo.vendas_geradas || 0) / resumo.conversas_iniciadas * 100).toFixed(1) : 0}% taxa de conversão`}
                icon={ShoppingCart}
              />
              <MetricCard
                title="FATURAMENTO"
                value={`R$ ${((resumo.receita_total || 0) / 1000).toFixed(1)}k`}
                subtitle={`${resumo.vendas_geradas || 0} veículos vendidos`}
                icon={Banknote}
              />
              <MetricCard
                title="ALCANCE"
                value={resumo.alcance.toLocaleString('pt-BR')}
                subtitle={`CTR: ${resumo.ctr_medio.toFixed(2)}%`}
                icon={Users}
              />
            </>
          )}
        </div>

        <InsightsCard insights={insights} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvolutionChart data={evolutionData} />
          <PerformanceChart data={performanceData} />
        </div>

        <AdsTable metricas={metricas} />

        <div className="text-center text-sm text-muted-foreground pb-4">
          Última atualização: há 2 horas
        </div>
      </main>
    </div>
  );
}
