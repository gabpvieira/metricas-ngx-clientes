import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Car, Trophy, Target } from "lucide-react";

interface PerformanceDataPoint {
  nome: string;
  conversas: number;
  gasto: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-xl min-w-[200px]">
        <div className="flex items-center gap-2 mb-3">
          <Car className="h-4 w-4 text-primary" />
          <p className="font-semibold text-foreground">{label}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Conversas:</span>
            <span className="font-semibold text-foreground">{data.conversas}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Investimento:</span>
            <span className="font-semibold text-foreground">
              R$ {data.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-sm text-muted-foreground">Custo por conversa:</span>
            <span className="font-semibold text-primary">
              {data.conversas > 0 
                ? `R$ ${(data.gasto / data.conversas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const getBarColor = (conversas: number, index: number) => {
  if (conversas === 0) return '#64748b'; // slate-500 for zero conversas
  
  const colors = [
    '#10b981', // emerald-500 - best performer
    '#3b82f6', // blue-500 - good performer  
    '#8b5cf6', // violet-500 - average performer
    '#f59e0b', // amber-500 - below average
    '#ef4444', // red-500 - poor performer
  ];
  
  return colors[index] || colors[colors.length - 1];
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  // Sort data by conversas for better visualization
  const sortedData = [...data].sort((a, b) => b.conversas - a.conversas);
  const maxConversas = Math.max(...sortedData.map(d => d.conversas));
  
  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg" data-testid="card-performance-chart">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Trophy className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Performance por Veículo
          </h3>
          <p className="text-sm text-muted-foreground">
            Ranking de conversas por modelo
          </p>
        </div>
      </div>
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart 
            data={sortedData} 
            layout="vertical" 
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <defs>
              {sortedData.map((_, index) => (
                <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={getBarColor(sortedData[index].conversas, index)} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={getBarColor(sortedData[index].conversas, index)} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="hsl(var(--border))" 
              opacity={0.2}
              horizontal={false}
            />
            
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, maxConversas + 1]}
            />
            
            <YAxis 
              dataKey="nome" 
              type="category" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ textAnchor: 'end' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="conversas" 
              radius={[0, 6, 6, 0]}
              name="Conversas"
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#barGradient${index})`}
                  stroke={getBarColor(entry.conversas, index)}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Performance indicators */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {sortedData.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              {index === 0 && <Trophy className="h-3 w-3 text-yellow-500" />}
              {index === 1 && <Target className="h-3 w-3 text-gray-400" />}
              {index === 2 && <Target className="h-3 w-3 text-amber-600" />}
            </div>
          ))}
        </div>
        
        {/* Overlay gradient for premium effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/5 to-transparent pointer-events-none rounded-lg" />
      </div>
      
      {/* Performance summary */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Melhor performance:</span>
          <span className="font-semibold text-foreground">
            {sortedData[0]?.nome || 'N/A'} ({sortedData[0]?.conversas || 0} conversas)
          </span>
        </div>
      </div>
    </Card>
  );
}
