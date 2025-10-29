import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ClientCard from "@/components/ClientCard";
import NewClientDialog from "@/components/NewClientDialog";
import { Plus, LogOut } from "lucide-react";
import { mockClientes as initialClientes, mockMetricas, calcularResumo } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { clientService } from '../services/clientService';
import type { ClienteInfo } from "@shared/schema";

function AdminPanelContent() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientes, setClientes] = useState<ClienteInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load clients from clientService
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Carregando clientes...');
      const result = await clientService.listClients();
      console.log('📊 Resultado do clientService.listClients():', result);
      if (result.success && result.data) {
        console.log('✅ Dados dos clientes recebidos:', result.data);
        setClientes(result.data);
      } else {
        console.log('❌ Falha ao carregar clientes:', result);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Replace with API call to get metrics for each client
  const resumoPorCliente = clientes.map(cliente => {
    // Por enquanto usando todas as métricas mock para cada cliente
    // Em produção, filtrar por cliente específico
    const metricas = mockMetricas; // Remover filtro por cliente_slug que não existe
    const resumo = calcularResumo(metricas);
    
    return {
      ...cliente,
      investimento: resumo.investimento_total,
      conversas: resumo.conversas_iniciadas,
      status: 'ativo' as const
    };
  });

  console.log('👥 Estado atual dos clientes:', clientes);
  console.log('📋 Resumo por cliente:', resumoPorCliente);

  const handleNovoCliente = () => {
    setDialogOpen(true);
  };

  const handleSubmitCliente = async (data: Omit<ClienteInfo, 'logo_url'>) => {
    // Reload clients list after successful creation
    await loadClients();
  };

  const handleLogout = () => {
    logout();
    setLocation("/ngx/login");
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
              <p className="text-sm text-muted-foreground">
                Admin • {user?.username}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleNovoCliente}
                className="hover-elevate"
                data-testid="button-new-client"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="hover-elevate"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumoPorCliente.map((cliente) => (
            <ClientCard
              key={cliente.slug}
              nome={cliente.nome}
              slug={cliente.slug}
              logoUrl={cliente.logo_url}
              investimento={cliente.investimento}
              conversas={cliente.conversas}
              status={cliente.status}
              onDelete={loadClients}
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

      <NewClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitCliente}
      />
    </div>
  );
}

export default function AdminPanel() {
  return (
    <ProtectedRoute>
      <AdminPanelContent />
    </ProtectedRoute>
  );
}
