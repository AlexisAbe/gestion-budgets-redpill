
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatDate } from '@/utils/dateUtils';

interface BudgetChartProps {
  campaign: Campaign;
  weeks: WeeklyView[];
}

export function BudgetChart({ campaign, weeks }: BudgetChartProps) {
  // Prepare chart data
  const chartData = weeks
    .filter(week => campaign.weeklyBudgets[week.weekLabel] !== undefined)
    .map(week => ({
      week: week.weekLabel,
      budget: campaign.weeklyBudgets[week.weekLabel] || 0,
      date: formatDate(week.startDate),
    }));

  const getColor = () => {
    switch (campaign.mediaChannel) {
      case 'META':
        return '#5B93FF';
      case 'GOOGLE':
        return '#17D188';
      case 'LINKEDIN':
        return '#0077B5';
      case 'TWITTER':
        return '#1DA1F2';
      case 'DISPLAY':
        return '#FF6B6B';
      case 'EMAIL':
        return '#9B87F5';
      default:
        return '#8E9196';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Budget Distribution: {campaign.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`colorBudget-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getColor()} stopOpacity={0.8} />
                <stop offset="95%" stopColor={getColor()} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 10 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'Budget']}
              labelFormatter={(label) => `Week ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="budget" 
              stroke={getColor()} 
              fillOpacity={1} 
              fill={`url(#colorBudget-${campaign.id})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
