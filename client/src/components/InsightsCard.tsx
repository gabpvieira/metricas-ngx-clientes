import { Card } from "@/components/ui/card";
import { CheckCircle2, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";

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
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getInsightStyle = (tipo: Insight['tipo']) => {
    switch (tipo) {
      case 'success':
        return "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-l-emerald-400 dark:from-emerald-950/30 dark:to-emerald-900/20";
      case 'opportunity':
        return "bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-amber-400 dark:from-amber-950/30 dark:to-amber-900/20";
      case 'warning':
        return "bg-gradient-to-r from-orange-50 to-orange-100/50 border-l-orange-400 dark:from-orange-950/30 dark:to-orange-900/20";
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/50 border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50" data-testid="card-insights">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-50" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Insights Estratégicos
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Análise inteligente dos seus resultados
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border-l-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${getInsightStyle(insight.tipo)}`}
              data-testid={`insight-${idx}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-sm">
                  {getIcon(insight.tipo)}
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {insight.mensagem}
                </p>
              </div>
            </div>
          ))}
          {insights.length === 0 && (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aguardando dados para gerar insights personalizados
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
