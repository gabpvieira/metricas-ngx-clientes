import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp } from "lucide-react";

interface ChartDataPoint {
  data: string;
  investimento: number;
  conversas: number;
}

interface EvolutionChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">
              {entry.name.includes('R$') ? `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shadow-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg" data-testid="card-evolution-chart">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Evolução de Conversas e Investimento
          </h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe o desempenho ao longo do tempo
          </p>
        </div>
      </div>
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="conversasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="investimentoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="conversasStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))"/>
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="investimentoStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.2}
              vertical={false}
            />
            
            <XAxis 
              dataKey="data" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="investimento"
              stroke="url(#investimentoStroke)"
              strokeWidth={3}
              fill="url(#investimentoGradient)"
              name="Investimento (R$)"
              dot={{ 
                fill: "#f59e0b", 
                strokeWidth: 2, 
                stroke: "#fff",
                r: 4,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              }}
              activeDot={{ 
                r: 6, 
                fill: "#f59e0b",
                stroke: "#fff",
                strokeWidth: 2,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
              }}
            />
            
            <Area
              type="monotone"
              dataKey="conversas"
              stroke="url(#conversasStroke)"
              strokeWidth={3}
              fill="url(#conversasGradient)"
              name="Conversas"
              dot={{ 
                fill: "hsl(var(--primary))", 
                strokeWidth: 2, 
                stroke: "#fff",
                r: 4,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              }}
              activeDot={{ 
                r: 6, 
                fill: "hsl(var(--primary))",
                stroke: "#fff",
                strokeWidth: 2,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
              }}
            />
            
            <Legend content={<CustomLegend />} />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Overlay gradient for premium effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent pointer-events-none rounded-lg" />
      </div>
    </Card>
  );
}
