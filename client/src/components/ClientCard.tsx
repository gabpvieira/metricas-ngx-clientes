import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface ClientCardProps {
  nome: string;
  slug: string;
  logoUrl?: string;
  investimento: number;
  conversas: number;
  status: 'ativo' | 'pausado';
}

export default function ClientCard({ 
  nome, 
  slug, 
  logoUrl, 
  investimento, 
  conversas, 
  status 
}: ClientCardProps) {
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
      
      <Link href={`/${slug}`}>
        <Button 
          className="w-full hover-elevate" 
          variant="outline"
          data-testid={`button-view-dashboard-${slug}`}
        >
          Ver Dashboard
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </Card>
  );
}
