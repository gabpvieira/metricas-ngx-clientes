import InsightsCard from '../InsightsCard';

export default function InsightsCardExample() {
  const mockInsights = [
    {
      tipo: 'success' as const,
      mensagem: 'AMAROK 3.0 V6 - 2024 gerou 2 conversa(s) (melhor anúncio)'
    },
    {
      tipo: 'opportunity' as const,
      mensagem: 'HILUX SW4 - 23/24 tem CTR de 11.1% - considere aumentar budget'
    },
    {
      tipo: 'warning' as const,
      mensagem: 'S10 HIGH COUNTRY tem CTR baixo (2.0%) - revisar criativo'
    }
  ];

  return (
    <div className="p-6 bg-background">
      <InsightsCard insights={mockInsights} />
    </div>
  );
}
