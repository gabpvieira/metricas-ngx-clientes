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
    <Card className="p-6 hover-elevate" data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[28px] font-bold text-foreground" data-testid={`text-metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground" data-testid={`text-metric-subtitle-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
