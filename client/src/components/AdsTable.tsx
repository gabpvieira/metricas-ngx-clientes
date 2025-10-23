import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import type { MetricaAnuncio } from "@shared/schema";

interface AdsTableProps {
  metricas: MetricaAnuncio[];
}

export default function AdsTable({ metricas }: AdsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof MetricaAnuncio | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof MetricaAnuncio) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredMetricas = metricas
    .filter(m => m.nome_anuncio.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      const aNum = typeof aVal === 'string' ? parseFloat(aVal) || 0 : aVal;
      const bNum = typeof bVal === 'string' ? parseFloat(bVal) || 0 : bVal;
      
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });

  const getCtrBadgeVariant = (ctr: string): 'default' | 'secondary' | 'destructive' => {
    const ctrValue = parseFloat(ctr);
    if (ctrValue > 2) return 'default';
    if (ctrValue >= 1) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="p-6" data-testid="card-ads-table">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="text-lg">📋</span>
          Anúncios Detalhados
        </h3>
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
                  Data
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
            {filteredMetricas.map((metrica) => (
              <tr 
                key={metrica.id} 
                className="border-b border-border hover:bg-muted/30 transition-colors"
                data-testid={`row-ad-${metrica.idx}`}
              >
                <td className="py-4 px-4 text-sm font-medium">
                  {metrica.nome_anuncio.length > 30 
                    ? metrica.nome_anuncio.substring(0, 30) + '...' 
                    : metrica.nome_anuncio}
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {new Date(metrica.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
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
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredMetricas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum anúncio encontrado.</p>
        </div>
      )}
    </Card>
  );
}
