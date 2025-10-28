import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcularPeriodo } from '@/lib/dateUtils';
import { fetchMetricasBySlug, calcularVendasPorPeriodo } from '@/lib/supabaseData';

interface PeriodTestDialogProps {
  clientSlug: string;
}

export default function PeriodTestDialog({ clientSlug }: PeriodTestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testPeriod = async () => {
    setIsLoading(true);
    try {
      const { dataInicio, dataFim } = calcularPeriodo(selectedPeriod);
      
      // Buscar métricas
      const metricas = await fetchMetricasBySlug(clientSlug, dataInicio, dataFim);
      
      // Buscar vendas
      const vendas = await calcularVendasPorPeriodo(clientSlug, dataInicio, dataFim);
      
      setTestResults({
        periodo: selectedPeriod,
        dataInicio: dataInicio.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0],
        totalMetricas: metricas.length,
        totalVendas: vendas.length,
        receitaTotal: vendas.reduce((sum, venda) => sum + parseFloat(venda.valor_veiculo), 0),
        metricas: metricas.slice(0, 3), // Primeiras 3 métricas
        vendas: vendas.slice(0, 3) // Primeiras 3 vendas
      });
    } catch (error) {
      console.error('Erro ao testar período:', error);
      setTestResults({ error: 'Erro ao buscar dados' });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          🧪 Testar Períodos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teste de Filtro de Período</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select value={selectedPeriod.toString()} onValueChange={(value) => setSelectedPeriod(parseInt(value))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Hoje</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={testPeriod} disabled={isLoading}>
              {isLoading ? 'Testando...' : 'Testar Período'}
            </Button>
          </div>
          
          {testResults && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {testResults.error ? (
                <div className="text-red-600">{testResults.error}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Período Selecionado</h4>
                      <p>{testResults.periodo === 0 ? 'Hoje' : `Últimos ${testResults.periodo} dias`}</p>
                      <p className="text-sm text-gray-600">
                        {testResults.dataInicio} até {testResults.dataFim}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Resultados</h4>
                      <p>Métricas: {testResults.totalMetricas}</p>
                      <p>Vendas: {testResults.totalVendas}</p>
                      <p>Receita: R$ {testResults.receitaTotal.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Métricas (primeiras 3)</h4>
                      <div className="text-sm space-y-1">
                        {testResults.metricas.map((metrica: any, index: number) => (
                          <div key={index} className="bg-white p-2 rounded">
                            <p>{metrica.anuncio_titulo}</p>
                            <p className="text-gray-600">{metrica.data_registro}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Vendas (primeiras 3)</h4>
                      <div className="text-sm space-y-1">
                        {testResults.vendas.map((venda: any, index: number) => (
                          <div key={index} className="bg-white p-2 rounded">
                            <p>{venda.anuncio_titulo}</p>
                            <p className="text-gray-600">
                              {new Date(venda.data_venda).toLocaleDateString('pt-BR')} - 
                              R$ {parseFloat(venda.valor_veiculo).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}