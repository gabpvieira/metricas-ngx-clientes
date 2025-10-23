import { Button } from "@/components/ui/button";
import ClientCard from "@/components/ClientCard";
import { Plus } from "lucide-react";
import { mockClientes, mockMetricas, calcularResumo } from "@/lib/mock-data";

export default function AdminPanel() {
  //todo: remove mock functionality - get clientes from API
  const clientes = mockClientes;

  //todo: remove mock functionality - calculate per client from API
  const resumoPorCliente = clientes.map(cliente => {
    const metricasCliente = mockMetricas;
    const resumo = calcularResumo(metricasCliente);
    return {
      ...cliente,
      investimento: resumo.investimento_total,
      conversas: resumo.conversas_iniciadas,
      status: 'ativo' as const
    };
  });

  const handleNovoCliente = () => {
    console.log('Novo cliente clicked - modal would open here');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-primary">NGX</span> Metrics
              </h1>
              <p className="text-sm text-muted-foreground">Admin</p>
            </div>
            <Button 
              onClick={handleNovoCliente}
              className="hover-elevate"
              data-testid="button-new-client"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">📊</span>
            Clientes Ativos
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os seus clientes e visualize suas métricas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumoPorCliente.map((cliente) => (
            <ClientCard
              key={cliente.slug}
              nome={cliente.nome}
              slug={cliente.slug}
              logoUrl={cliente.logo_url}
              investimento={cliente.investimento}
              conversas={cliente.conversas}
              status={cliente.status}
            />
          ))}
        </div>

        {clientes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum cliente cadastrado ainda.</p>
            <Button onClick={handleNovoCliente}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Cliente
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
