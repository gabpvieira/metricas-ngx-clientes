import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, ArrowUpDown, Eye, Layers, List, Info } from "lucide-react";
import { useState, useMemo } from "react";
import type { MetricaAnuncio } from "@shared/schema";
import { aggregateAdsByName, checkForDuplicateAds, type MetricaAnuncioAgregada } from "@/lib/adsAggregation";

interface AdsTableProps {
  metricas: MetricaAnuncio[];
}

export default function AdsTable({ metricas }: AdsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof MetricaAnuncio | null>('data_registro');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false);
  const [isAggregated, setIsAggregated] = useState(false);

  const handleSort = (field: keyof MetricaAnuncio) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Processa dados agregados e informações sobre duplicatas
  const { aggregatedData, duplicateInfo } = useMemo(() => {
    const duplicateInfo = checkForDuplicateAds(metricas);
    const aggregatedData = aggregateAdsByName(metricas);
    
    return { aggregatedData, duplicateInfo };
  }, [metricas]);

  // Determina quais dados usar baseado no modo de visualização
  const currentData = useMemo(() => {
    return isAggregated ? aggregatedData : metricas;
  }, [isAggregated, aggregatedData, metricas]);

  // Filtrar por data (últimos 7 dias por padrão) e busca
  const filteredMetricas = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    return currentData
      .filter((m: any) => {
        // Filtro de busca
        const matchesSearch = m.nome_anuncio.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtro de data (apenas se não estiver mostrando todos)
        if (showAll) {
          return matchesSearch;
        }
        
        // Para dados agregados, verifica se algum anúncio está dentro do período
        if (isAggregated && 'data_fim' in m) {
          const dataFim = new Date(m.data_fim);
          const isWithinSevenDays = dataFim >= sevenDaysAgo;
          return matchesSearch && isWithinSevenDays;
        }
        
        // Para dados normais
        const metricaDate = new Date(m.data_registro);
        const isWithinSevenDays = metricaDate >= sevenDaysAgo;
        
        return matchesSearch && isWithinSevenDays;
      })
      .sort((a: any, b: any) => {
        // Ordenação padrão por data (mais recente primeiro)
        if (!sortField) {
          const dateA = new Date(a.data_registro);
          const dateB = new Date(b.data_registro);
          return dateB.getTime() - dateA.getTime();
        }
        
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        // Tratamento especial para datas
        if (sortField === 'data_registro') {
          const dateA = new Date(aVal as string);
          const dateB = new Date(bVal as string);
          return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }
        
        const aNum = typeof aVal === 'string' ? parseFloat(aVal) || 0 : aVal;
        const bNum = typeof bVal === 'string' ? parseFloat(bVal) || 0 : bVal;
        
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      });
  }, [currentData, searchTerm, sortField, sortDirection, showAll, isAggregated]);

  // Verificar se há anúncios além dos últimos 7 dias
  const hasMoreAds = useMemo(() => {
    if (showAll) return false;
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    return currentData.some((m: any) => {
      const matchesSearch = m.nome_anuncio.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (isAggregated && 'data_fim' in m) {
        const dataFim = new Date(m.data_fim);
        return matchesSearch && dataFim < sevenDaysAgo;
      }
      
      const metricaDate = new Date(m.data_registro);
      return matchesSearch && metricaDate < sevenDaysAgo;
    });
  }, [currentData, searchTerm, showAll, isAggregated]);

  const getCtrBadgeVariant = (ctr: string): 'default' | 'secondary' | 'destructive' => {
    const ctrValue = parseFloat(ctr);
    if (ctrValue > 2) return 'default';
    if (ctrValue >= 1) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="p-6" data-testid="card-ads-table">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="text-lg">📋</span>
              Anúncios {isAggregated ? 'Consolidados' : 'Detalhados'}
            </h3>
            
            {/* Toggle de Agregação */}
            <div className="flex items-center gap-2">
              <Button
                variant={isAggregated ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAggregated(true)}
                className="h-8 px-3"
                data-testid="button-aggregated-view"
              >
                <Layers className="w-3 h-3 mr-1" />
                Consolidado
              </Button>
              <Button
                variant={!isAggregated ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAggregated(false)}
                className="h-8 px-3"
                data-testid="button-detailed-view"
              >
                <List className="w-3 h-3 mr-1" />
                Detalhado
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">
              {showAll ? 'Mostrando todos os anúncios' : 'Últimos 7 dias'}
              {filteredMetricas.length > 0 && ` • ${filteredMetricas.length} anúncio${filteredMetricas.length !== 1 ? 's' : ''}`}
            </p>
            
            {/* Informações sobre duplicatas */}
            {duplicateInfo.hasDuplicates && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                <Info className="w-3 h-3" />
                <span>
                  {duplicateInfo.reductionCount} anúncios duplicados encontrados
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar anúncio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-ads"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('nome_anuncio')}
                  className="hover-elevate -ml-4"
                  data-testid="button-sort-anuncio"
                >
                  Anúncio
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('data_registro')}
                  className="hover-elevate -ml-4"
                  data-testid="button-sort-data"
                >
                  {isAggregated ? 'Período' : 'Data'}
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('valor_gasto')}
                  className="hover-elevate -mr-4 ml-auto"
                  data-testid="button-sort-gasto"
                >
                  Gasto
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('conversas_iniciadas')}
                  className="hover-elevate -mr-4 ml-auto"
                  data-testid="button-sort-conversas"
                >
                  Conv
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('cpc_todos')}
                  className="hover-elevate -mr-4 ml-auto"
                  data-testid="button-sort-cpc"
                >
                  CPC
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('impressoes')}
                  className="hover-elevate -mr-4 ml-auto"
                  data-testid="button-sort-impressoes"
                >
                  Impr.
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('ctr_todos')}
                  className="hover-elevate -mr-4 ml-auto"
                  data-testid="button-sort-ctr"
                >
                  CTR
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMetricas.map((metrica: any) => {
              const isAggregatedRow = 'total_dias' in metrica;
              
              return (
                <tr 
                  key={metrica.id} 
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                  data-testid={`row-ad-${metrica.idx}`}
                >
                  <td className="py-4 px-4 text-sm font-medium">
                    <div className="flex flex-col">
                      <span>
                        {metrica.nome_anuncio.length > 30 
                          ? metrica.nome_anuncio.substring(0, 30) + '...' 
                          : metrica.nome_anuncio}
                      </span>
                      {isAggregatedRow && (
                        <span className="text-xs text-muted-foreground">
                          {metrica.total_dias} dia{metrica.total_dias !== 1 ? 's' : ''} de campanha
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {isAggregatedRow ? (
                      <div className="flex flex-col">
                        <span className="text-xs">
                          {new Date(metrica.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {new Date(metrica.data_fim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Última: {new Date(metrica.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      new Date(metrica.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-right font-medium">
                    R$ {parseFloat(metrica.valor_gasto).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-sm text-right font-semibold text-primary">
                    {metrica.conversas_iniciadas}
                  </td>
                  <td className="py-4 px-4 text-sm text-right text-muted-foreground">
                    R$ {parseFloat(metrica.cpc_todos).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-sm text-right text-muted-foreground">
                    {metrica.impressoes.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Badge variant={getCtrBadgeVariant(metrica.ctr_todos)} className="text-xs">
                      {parseFloat(metrica.ctr_todos).toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(metrica.link_criativo, '_blank')}
                      data-testid={`button-view-creative-${metrica.idx}`}
                      className="hover-elevate"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredMetricas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum anúncio encontrado.</p>
        </div>
      )}
      
      {hasMoreAds && (
        <div className="flex justify-center pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
            className="hover-elevate"
            data-testid="button-show-more-ads"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver mais anúncios
          </Button>
        </div>
      )}
      
      {showAll && (
        <div className="flex justify-center pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(false)}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-show-less-ads"
          >
            Mostrar apenas últimos 7 dias
          </Button>
        </div>
      )}
    </Card>
  );
}
