import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface DashboardHeaderProps {
  clientName: string;
  logoUrl?: string;
  period: string;
  onPeriodChange: (period: string) => void;
}

export default function DashboardHeader({ 
  clientName, 
  logoUrl, 
  period, 
  onPeriodChange 
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <div className="h-12 rounded-lg bg-card border border-card-border flex items-center justify-center overflow-hidden px-4">
              {logoUrl ? (
                <img src={logoUrl} alt={`${clientName} logo`} className="h-full object-contain" />
              ) : (
                <Building2 className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Período:</span>
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-[180px]" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="mes-atual">Mês atual</SelectItem>
                <SelectItem value="mes-passado">Mês passado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
