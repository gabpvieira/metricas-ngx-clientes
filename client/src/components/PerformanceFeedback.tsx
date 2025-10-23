import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { PerformanceFeedback as FeedbackType, FeedbackLevel } from "@/lib/performance-feedback";

interface PerformanceFeedbackProps {
  feedbacks: FeedbackType[];
}

const getLevelConfig = (nivel: FeedbackLevel) => {
  switch (nivel) {
    case 'excellent':
      return {
        color: 'border-chart-2 bg-chart-2/5',
        icon: CheckCircle2,
        iconColor: 'text-chart-2',
        textColor: 'text-chart-2'
      };
    case 'good':
      return {
        color: 'border-primary bg-primary/5',
        icon: TrendingUp,
        iconColor: 'text-primary',
        textColor: 'text-primary'
      };
    case 'acceptable':
      return {
        color: 'border-chart-4 bg-chart-4/5',
        icon: TrendingUp,
        iconColor: 'text-chart-4',
        textColor: 'text-chart-4'
      };
    case 'warning':
      return {
        color: 'border-chart-3 bg-chart-3/5',
        icon: AlertTriangle,
        iconColor: 'text-chart-3',
        textColor: 'text-chart-3'
      };
    case 'critical':
      return {
        color: 'border-destructive bg-destructive/5',
        icon: AlertCircle,
        iconColor: 'text-destructive',
        textColor: 'text-destructive'
      };
  }
};

export default function PerformanceFeedback({ feedbacks }: PerformanceFeedbackProps) {
  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="section-performance-feedback">
      <div>
        <h2 className="text-xl font-semibold mb-1">🔍 Análise e Feedback da Performance</h2>
        <p className="text-sm text-muted-foreground">
          Interpretação automática das suas métricas baseada em padrões de mercado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.map((feedback, idx) => {
          const config = getLevelConfig(feedback.nivel);
          const Icon = config.icon;

          return (
            <Card
              key={idx}
              className={`p-5 border-l-4 ${config.color} hover-elevate`}
              data-testid={`card-feedback-${feedback.tipo}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background/50 ${config.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {feedback.titulo}
                    </h3>
                    {feedback.valor && (
                      <span className={`text-sm font-bold ${config.textColor} whitespace-nowrap`}>
                        {feedback.valor}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90">
                    {feedback.mensagem}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
