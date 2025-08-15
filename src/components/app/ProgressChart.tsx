"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const chartData = [
  { month: "Jan", Français: 45, Mathématiques: 50, "Économie & Droit": 35, Anglais: 60, Comptabilité: 40 },
  { month: "Fév", Français: 50, Mathématiques: 55, "Économie & Droit": 40, Anglais: 65, Comptabilité: 48 },
  { month: "Mar", Français: 58, Mathématiques: 60, "Économie & Droit": 50, Anglais: 68, Comptabilité: 55 },
  { month: "Avr", Français: 62, Mathématiques: 65, "Économie & Droit": 55, Anglais: 72, Comptabilité: 60 },
  { month: "Mai", Français: 65, Mathématiques: 70, "Économie & Droit": 60, Anglais: 75, Comptabilité: 68 },
  { month: "Juin", Français: 70, Mathématiques: 72, "Économie & Droit": 65, Anglais: 80, Comptabilité: 75 },
];

const subjectColors = {
  "Français": "hsl(var(--chart-1))",
  "Mathématiques": "hsl(var(--chart-2))",
  "Économie & Droit": "hsl(var(--chart-3))",
  "Anglais": "hsl(var(--chart-4))",
  "Comptabilité": "hsl(var(--chart-5))",
};

export function ProgressChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} id="progress-chart">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          {Object.entries(subjectColors).map(([subject, color]) => (
             <Line key={subject} type="monotone" dataKey={subject} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
