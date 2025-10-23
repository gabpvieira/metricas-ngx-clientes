import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Check } from "lucide-react";
import type { TipoNegocio } from "@shared/schema";

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    nome: string;
    slug: string;
    tipo_negocio: TipoNegocio;
    meta_mensal_conversas?: number;
    meta_mensal_investimento?: number;
    meta_mensal_vendas?: number;
    meta_roi?: number;
  }) => void;
}

export default function NewClientDialog({ open, onOpenChange, onSubmit }: NewClientDialogProps) {
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>("mensagens");
  const [metaConversas, setMetaConversas] = useState("");
  const [metaInvestimento, setMetaInvestimento] = useState("");
  const [metaVendas, setMetaVendas] = useState("");
  const [metaROI, setMetaROI] = useState("");

  const handleNomeChange = (value: string) => {
    setNome(value);
    // Auto-generate slug
    const autoSlug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug ? `${autoSlug}-dash` : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      nome,
      slug,
      tipo_negocio: tipoNegocio,
      meta_mensal_conversas: metaConversas ? parseInt(metaConversas) : undefined,
      meta_mensal_investimento: metaInvestimento ? parseFloat(metaInvestimento) : undefined,
      meta_mensal_vendas: metaVendas ? parseInt(metaVendas) : undefined,
      meta_roi: metaROI ? parseFloat(metaROI) : undefined,
    });

    // Reset form
    setNome("");
    setSlug("");
    setTipoNegocio("mensagens");
    setMetaConversas("");
    setMetaInvestimento("");
    setMetaVendas("");
    setMetaROI("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Cadastre um novo cliente e configure o tipo de dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informações Básicas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cliente *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => handleNomeChange(e.target.value)}
                placeholder="Ex: SA Veículos"
                required
                data-testid="input-client-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ex: saveiculos-dash"
                required
                data-testid="input-client-slug"
              />
              <p className="text-xs text-muted-foreground">
                O dashboard ficará em: /{slug}
              </p>
            </div>
          </div>

          {/* Tipo de Negócio */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Tipo de Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  tipoNegocio === "mensagens"
                    ? "border-primary bg-primary/5"
                    : "hover-elevate"
                }`}
                onClick={() => setTipoNegocio("mensagens")}
                data-testid="card-type-mensagens"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <MessageSquare className="w-5 h-5 text-chart-2" />
                  </div>
                  {tipoNegocio === "mensagens" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <h4 className="font-semibold mb-1">Mensagens / Leads</h4>
                <p className="text-xs text-muted-foreground">
                  Focado em quantidade de conversas iniciadas e custo por lead. Ideal para geração de leads.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <li>• Conversas Iniciadas</li>
                  <li>• Custo por Conversa</li>
                  <li>• Vendas Geradas</li>
                </ul>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${
                  tipoNegocio === "vendas"
                    ? "border-primary bg-primary/5"
                    : "hover-elevate"
                }`}
                onClick={() => setTipoNegocio("vendas")}
                data-testid="card-type-vendas"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-chart-3/10">
                    <TrendingUp className="w-5 h-5 text-chart-3" />
                  </div>
                  {tipoNegocio === "vendas" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <h4 className="font-semibold mb-1">Vendas / ROI</h4>
                <p className="text-xs text-muted-foreground">
                  Focado em vendas efetivadas, receita e retorno sobre investimento (ROI).
                </p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <li>• Vendas Realizadas</li>
                  <li>• Receita Total</li>
                  <li>• ROI Percentual</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Metas Mensais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Metas Mensais (Opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta-investimento">Meta de Investimento (R$)</Label>
                <Input
                  id="meta-investimento"
                  type="number"
                  step="0.01"
                  value={metaInvestimento}
                  onChange={(e) => setMetaInvestimento(e.target.value)}
                  placeholder="Ex: 5000"
                  data-testid="input-meta-investment"
                />
              </div>

              {tipoNegocio === "mensagens" && (
                <div className="space-y-2">
                  <Label htmlFor="meta-conversas">Meta de Conversas</Label>
                  <Input
                    id="meta-conversas"
                    type="number"
                    value={metaConversas}
                    onChange={(e) => setMetaConversas(e.target.value)}
                    placeholder="Ex: 10"
                    data-testid="input-meta-conversations"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="meta-vendas">Meta de Vendas</Label>
                <Input
                  id="meta-vendas"
                  type="number"
                  value={metaVendas}
                  onChange={(e) => setMetaVendas(e.target.value)}
                  placeholder="Ex: 3"
                  data-testid="input-meta-sales"
                />
              </div>

              {tipoNegocio === "vendas" && (
                <div className="space-y-2">
                  <Label htmlFor="meta-roi">Meta de ROI (%)</Label>
                  <Input
                    id="meta-roi"
                    type="number"
                    step="0.01"
                    value={metaROI}
                    onChange={(e) => setMetaROI(e.target.value)}
                    placeholder="Ex: 300"
                    data-testid="input-meta-roi"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!nome || !slug}
              data-testid="button-submit-client"
            >
              Criar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
