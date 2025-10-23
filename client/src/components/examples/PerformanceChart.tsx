import PerformanceChart from '../PerformanceChart';

export default function PerformanceChartExample() {
  const mockData = [
    { nome: 'AMAROK 3.0', conversas: 2, gasto: 35.38 },
    { nome: 'RANGER XLT', conversas: 1, gasto: 28.50 },
    { nome: 'HILUX SW4', conversas: 0, gasto: 1.10 },
    { nome: 'S10 HIGH', conversas: 0, gasto: 18.20 },
    { nome: 'TORO ULTRA', conversas: 0, gasto: 12.75 },
  ];

  return (
    <div className="p-6 bg-background">
      <PerformanceChart data={mockData} />
    </div>
  );
}
