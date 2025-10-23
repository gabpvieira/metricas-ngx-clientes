import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";
import InsightsCard from "@/components/InsightsCard";
import PerformanceFeedback from "@/components/PerformanceFeedback";
import EvolutionChart from "@/components/EvolutionChart";
import PerformanceChart from "@/components/PerformanceChart";
import AdsTable from "@/components/AdsTable";
import { DollarSign, MessageSquare, Eye, Users, ShoppingCart, TrendingUp, Percent } from "lucide-react";
import { mockMetricas, mockClientes, calcularResumo, gerarInsights } from "@/lib/mock-data";
import { gerarFeedbacks } from "@/lib/performance-feedback";

export default function ClientDashboard() {
  const [, params] = useRoute("/:slug");
  const [period, setPeriod] = useState("30dias");

  //todo: remove mock functionality - get cliente from API
  const cliente = mockClientes.find(c => c.slug === params?.slug) || mockClientes[0];
  
  //todo: remove mock functionality - filter metricas by period from API
  const metricas = mockMetricas;
  
  const resumo = useMemo(() => calcularResumo(metricas, cliente.tipo_negocio), [metricas, cliente.tipo_negocio]);
  const insights = useMemo(() => gerarInsights(metricas), [metricas]);
  const feedbacks = useMemo(() => gerarFeedbacks(resumo, cliente.tipo_negocio), [resumo, cliente.tipo_negocio]);
  
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

  //todo: remove mock functionality - generate from real data
  const performanceData = useMemo(() => {
    return [...metricas]
      .sort((a, b) => b.conversas_iniciadas - a.conversas_iniciadas)
      .slice(0, 5)
      .map(m => ({
        nome: m.nome_anuncio.substring(0, 15),
        conversas: m.conversas_iniciadas,
        gasto: parseFloat(m.valor_gasto)
      }));
  }, [metricas]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        clientName={cliente.nome}
        logoUrl={cliente.logo_url}
        period={period}
        onPeriodChange={setPeriod}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="INVESTIMENTO"
            value={`R$ ${resumo.investimento_total.toFixed(2)}`}
            subtitle="Total do período"
            icon={DollarSign}
          />
          
          {cliente.tipo_negocio === 'mensagens' ? (
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
                title="ALCANCE"
                value={resumo.alcance.toLocaleString('pt-BR')}
                subtitle={`CTR: ${resumo.ctr_medio.toFixed(2)}%`}
                icon={Users}
              />
            </>
          ) : (
            <>
              <MetricCard
                title="VENDAS"
                value={resumo.vendas_geradas || 0}
                subtitle={`R$ ${((resumo.receita_total || 0) / 1000).toFixed(1)}k receita`}
                icon={ShoppingCart}
              />
              <MetricCard
                title="ROI"
                value={`${(resumo.roi || 0).toFixed(0)}%`}
                subtitle={`Ticket: R$ ${((resumo.ticket_medio || 0) / 1000).toFixed(0)}k`}
                icon={TrendingUp}
              />
              <MetricCard
                title="CONVERSÕES"
                value={resumo.conversas_iniciadas}
                subtitle={`${resumo.conversas_iniciadas > 0 ? ((resumo.vendas_geradas || 0) / resumo.conversas_iniciadas * 100).toFixed(1) : 0}% efetivadas`}
                icon={Percent}
              />
            </>
          )}
        </div>

        <InsightsCard insights={insights} />

        <PerformanceFeedback feedbacks={feedbacks} />

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
