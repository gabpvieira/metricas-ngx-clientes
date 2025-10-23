import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceDataPoint {
  nome: string;
  conversas: number;
  gasto: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card className="p-6" data-testid="card-performance-chart">
      <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
        <span className="text-lg">🚗</span>
        Performance por Veículo
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            type="number" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            dataKey="nome" 
            type="category" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
            width={120}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Bar 
            dataKey="conversas" 
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]}
            name="Conversas"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
