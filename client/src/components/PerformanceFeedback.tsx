import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Target } from "lucide-react";
import type { PerformanceFeedback as FeedbackType, FeedbackLevel } from "@/lib/performance-feedback";

interface PerformanceFeedbackProps {
  feedbacks: FeedbackType[];
}

const getLevelConfig = (nivel: FeedbackLevel) => {
  switch (nivel) {
    case 'excellent':
      return {
        gradient: 'bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 dark:from-emerald-950/20 dark:via-emerald-900/30 dark:to-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2,
        iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        iconColor: 'text-white',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        valueColor: 'text-emerald-800 dark:text-emerald-200'
      };
    case 'good':
      return {
        gradient: 'bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 dark:from-blue-950/20 dark:via-blue-900/30 dark:to-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: TrendingUp,
        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        iconColor: 'text-white',
        textColor: 'text-blue-700 dark:text-blue-300',
        valueColor: 'text-blue-800 dark:text-blue-200'
      };
    case 'acceptable':
      return {
        gradient: 'bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-950/20 dark:via-slate-900/30 dark:to-slate-950/20',
        border: 'border-slate-200 dark:border-slate-800',
        icon: TrendingUp,
        iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
        iconColor: 'text-white',
        textColor: 'text-slate-700 dark:text-slate-300',
        valueColor: 'text-slate-800 dark:text-slate-200'
      };
    case 'warning':
      return {
        gradient: 'bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950/20 dark:via-amber-900/30 dark:to-amber-950/20',
        border: 'border-amber-200 dark:border-amber-800',
        icon: AlertTriangle,
        iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
        iconColor: 'text-white',
        textColor: 'text-amber-700 dark:text-amber-300',
        valueColor: 'text-amber-800 dark:text-amber-200'
      };
    case 'critical':
      return {
        gradient: 'bg-gradient-to-br from-red-50 via-red-100/50 to-red-50 dark:from-red-950/20 dark:via-red-900/30 dark:to-red-950/20',
        border: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
        iconColor: 'text-white',
        textColor: 'text-red-700 dark:text-red-300',
        valueColor: 'text-red-800 dark:text-red-200'
      };
  }
};

export default function PerformanceFeedback({ feedbacks }: PerformanceFeedbackProps) {
  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" data-testid="section-performance-feedback">
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Análise de Performance
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Métricas essenciais para o crescimento do seu negócio
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((feedback, idx) => {
          const config = getLevelConfig(feedback.nivel);
          const Icon = config.icon;

          return (
            <Card
              key={idx}
              className={`relative overflow-hidden ${config.gradient} ${config.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm`}
              data-testid={`card-feedback-${feedback.tipo}`}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-lg" />
              
              <div className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${config.iconBg} shadow-lg`}>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {feedback.titulo}
                      </h3>
                      {feedback.valor && (
                        <div className="text-right">
                          <span className={`text-lg font-bold ${config.valueColor} whitespace-nowrap block`}>
                            {feedback.valor}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className={`text-sm font-medium ${config.textColor} leading-relaxed`}>
                      {feedback.mensagem}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
