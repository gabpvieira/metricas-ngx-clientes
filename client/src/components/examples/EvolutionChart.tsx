import EvolutionChart from '../EvolutionChart';

export default function EvolutionChartExample() {
  const mockData = [
    { data: '13/10', investimento: 12.75, conversas: 0 },
    { data: '14/10', investimento: 18.20, conversas: 0 },
    { data: '15/10', investimento: 28.50, conversas: 1 },
    { data: '16/10', investimento: 36.48, conversas: 2 },
  ];

  return (
    <div className="p-6 bg-background">
      <EvolutionChart data={mockData} />
    </div>
  );
}
