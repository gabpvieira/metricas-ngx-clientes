import PerformanceFeedback from '../PerformanceFeedback';
import type { PerformanceFeedback as FeedbackType } from '@/lib/performance-feedback';

export default function PerformanceFeedbackExample() {
  const mockFeedbacks: FeedbackType[] = [
    {
      tipo: 'cpl',
      nivel: 'good',
      titulo: 'CPL (Custo Por Lead)',
      mensagem: 'Bom desempenho nos leads gerados.',
      valor: 'R$ 10,21'
    },
    {
      tipo: 'performance',
      nivel: 'excellent',
      titulo: 'Performance Geral',
      mensagem: 'Excelente engajamento e custo por clique.',
      valor: 'CTR: 3,1% | CPC: R$ 0,72'
    },
    {
      tipo: 'roi',
      nivel: 'good',
      titulo: 'ROI (Retorno sobre Investimento)',
      mensagem: 'Bom retorno, continue assim!',
      valor: '187%'
    }
  ];

  return (
    <div className="p-6 bg-background">
      <PerformanceFeedback feedbacks={mockFeedbacks} />
    </div>
  );
}
