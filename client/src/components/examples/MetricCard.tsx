import MetricCard from '../MetricCard';
import { DollarSign } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-background">
      <MetricCard
        title="INVESTIMENTO"
        value="R$ 95,93"
        subtitle="Últimos 30 dias"
        icon={DollarSign}
      />
      <MetricCard
        title="CONVERSAS"
        value="3"
        subtitle="R$ 31,98/conv"
      />
      <MetricCard
        title="IMPRESSÕES"
        value="4.926"
        subtitle="CPM: R$ 19,48"
      />
      <MetricCard
        title="ALCANCE"
        value="3.450"
        subtitle="CTR: 2,30%"
      />
    </div>
  );
}
