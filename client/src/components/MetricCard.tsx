import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export default function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="p-4 hover-elevate" data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground leading-tight">
          {title}
        </p>
        {Icon && (
          <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-xl font-bold text-foreground leading-tight" data-testid={`text-metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight" data-testid={`text-metric-subtitle-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
