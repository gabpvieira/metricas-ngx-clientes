import AdsTable from '../AdsTable';
import { mockMetricas } from '@/lib/mock-data';

export default function AdsTableExample() {
  return (
    <div className="p-6 bg-background">
      <AdsTable metricas={mockMetricas} />
    </div>
  );
}
