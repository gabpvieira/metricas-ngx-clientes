import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';
import { MetricaAnuncio } from '../../../shared/schema';

interface AddSaleDialogProps {
  metricas: MetricaAnuncio[];
  clientSlug: string;
}

interface SaleData {
  anuncio_id: string;
  anuncio_titulo: string;
  valor_veiculo: number;
  data_venda: Date;
  cliente_slug: string;
}

export function AddSaleDialog({ metricas, clientSlug }: AddSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState<string>('');
  const [valorVeiculo, setValorVeiculo] = useState<string>('');
  const [dataSelecionada, setDataSelecionada] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Helper para obter tabela de vendas baseada no slug
  const getVendasTableName = (slug: string): string => {
    if (slug === 'saveiculos-dash') return 'dash_sa_veiculos_vendas';
    const baseSlug = slug.replace('-dash', '').replace(/-/g, '_');
    return `dash_${baseSlug}_vendas`;
  };

  const addSaleMutation = useMutation({
    mutationFn: async (saleData: SaleData) => {
      const tableName = getVendasTableName(clientSlug);
      const { data, error } = await supabase
        .from(tableName)
        .insert([saleData])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas', clientSlug] });
      queryClient.invalidateQueries({ queryKey: ['metricas', clientSlug] });
      setOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setSelectedAnuncio('');
    setValorVeiculo('');
    setDataSelecionada(undefined);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAnuncio || !valorVeiculo || !dataSelecionada) {
      return;
    }

    setIsSubmitting(true);

    const anuncioSelecionado = metricas.find(m => m.id === selectedAnuncio);
    if (!anuncioSelecionado) return;

    const saleData: SaleData = {
      anuncio_id: selectedAnuncio,
      anuncio_titulo: anuncioSelecionado.nome_anuncio,
      valor_veiculo: parseFloat(valorVeiculo.replace(/[^\d,]/g, '').replace(',', '.')),
      data_venda: dataSelecionada,
      cliente_slug: clientSlug,
    };

    try {
      await addSaleMutation.mutateAsync(saleData);
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(parseInt(numericValue) || 0);
    
    return formattedValue;
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValorVeiculo(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Venda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anuncio">Anúncio que gerou a venda</Label>
            <Select value={selectedAnuncio} onValueChange={setSelectedAnuncio}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o anúncio..." />
              </SelectTrigger>
              <SelectContent>
                {metricas.map((metrica) => (
                  <SelectItem key={metrica.id} value={metrica.id}>
                    {metrica.nome_anuncio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor do Veículo</Label>
            <Input
              id="valor"
              type="text"
              placeholder="R$ 0"
              value={valorVeiculo}
              onChange={handleValorChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data da Venda</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataSelecionada && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataSelecionada ? (
                    format(dataSelecionada, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={setDataSelecionada}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedAnuncio || !valorVeiculo || !dataSelecionada || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Venda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddSaleDialog;