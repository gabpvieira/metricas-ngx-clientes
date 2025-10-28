import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { clientService } from '../services/clientService';

interface ClientCardProps {
  nome: string;
  slug: string;
  logoUrl?: string;
  investimento: number;
  conversas: number;
  status: 'ativo' | 'pausado';
  onDelete?: () => void;
}

export default function ClientCard({ 
  nome, 
  slug, 
  logoUrl, 
  investimento, 
  conversas, 
  status,
  onDelete
}: ClientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await clientService.deleteClient(slug);
      
      if (result.success) {
        toast({
          title: "Cliente excluído com sucesso!",
          description: `${nome} foi removido e suas tabelas Supabase foram excluídas.`,
        });
        onDelete?.();
      } else {
        toast({
          title: "Erro ao excluir cliente",
          description: result.error || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Card className="p-6 hover-elevate" data-testid={`card-client-${slug}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-card border border-card-border flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={`${nome} logo`} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base" data-testid={`text-client-name-${slug}`}>
              {nome}
            </h3>
            <p className="text-xs text-muted-foreground">/{slug}</p>
          </div>
        </div>
        <Badge 
          variant={status === 'ativo' ? 'default' : 'secondary'}
          data-testid={`badge-status-${slug}`}
        >
          {status === 'ativo' ? '🟢 Ativo' : '⏸️ Pausado'}
        </Badge>
      </div>
      
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div>
          <span className="text-muted-foreground">Investimento: </span>
          <span className="font-semibold" data-testid={`text-investment-${slug}`}>
            R$ {investimento.toFixed(2)}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div>
          <span className="text-muted-foreground">Conversas: </span>
          <span className="font-semibold text-primary" data-testid={`text-conversations-${slug}`}>
            {conversas}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Link href={`/${slug}`} className="flex-1">
          <Button 
            className="w-full hover-elevate" 
            variant="outline"
            data-testid={`button-view-dashboard-${slug}`}
          >
            Ver Dashboard
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
                data-testid={`button-delete-${slug}`}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o cliente <strong>{nome}</strong>?
                  <br /><br />
                  Esta ação irá:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Remover o cliente do painel administrativo</li>
                    <li>Excluir as tabelas <code>dash_{slug}_rows</code> e <code>dash_{slug}_vendas</code> do Supabase</li>
                    <li>Tornar o dashboard /{slug} inacessível</li>
                  </ul>
                  <br />
                  <strong>Esta ação não pode ser desfeita.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir Cliente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </Card>
  );
}
