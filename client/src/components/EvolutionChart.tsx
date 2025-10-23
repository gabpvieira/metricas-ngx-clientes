import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataPoint {
  data: string;
  investimento: number;
  conversas: number;
}

interface EvolutionChartProps {
  data: ChartDataPoint[];
}

export default function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <Card className="p-6" data-testid="card-evolution-chart">
      <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
        <span className="text-lg">📊</span>
        Evolução de Conversas e Investimento
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="data" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend 
            wrapperStyle={{
              fontSize: '12px',
              paddingTop: '16px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="conversas" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Conversas"
            dot={{ fill: 'hsl(var(--primary))' }}
          />
          <Line 
            type="monotone" 
            dataKey="investimento" 
            stroke="hsl(var(--chart-3))" 
            strokeWidth={2}
            name="Investimento (R$)"
            dot={{ fill: 'hsl(var(--chart-3))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
