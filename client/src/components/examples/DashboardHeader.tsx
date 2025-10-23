import DashboardHeader from '../DashboardHeader';
import { useState } from 'react';

export default function DashboardHeaderExample() {
  const [period, setPeriod] = useState('30dias');
  
  return (
    <div className="bg-background">
      <DashboardHeader
        clientName="SA Veículos"
        period={period}
        onPeriodChange={(p) => {
          console.log('Period changed to:', p);
          setPeriod(p);
        }}
      />
    </div>
  );
}
