import { Card } from "@/components/ui/card";
import { CheckCircle2, Lightbulb, AlertTriangle } from "lucide-react";

interface Insight {
  tipo: 'success' | 'opportunity' | 'warning';
  mensagem: string;
}

interface InsightsCardProps {
  insights: Insight[];
}

export default function InsightsCard({ insights }: InsightsCardProps) {
  const getIcon = (tipo: Insight['tipo']) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-chart-2" />;
      case 'opportunity':
        return <Lightbulb className="w-4 h-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-chart-3" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-l-4 border-l-primary" data-testid="card-insights">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        Insights Automáticos
      </h3>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3"
            data-testid={`insight-${idx}`}
          >
            <div className="mt-0.5">
              {getIcon(insight.tipo)}
            </div>
            <p className="text-sm text-foreground/90">
              {insight.mensagem}
            </p>
          </div>
        ))}
        {insights.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum insight disponível no momento.
          </p>
        )}
      </div>
    </Card>
  );
}
