
import React from 'react';
import { BudgetCard } from './BudgetCard';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/budget';

interface WeeklyBudgetCardProps {
  weekLabel: string;
  weeklyPlannedBudget: number;
  weeklyActualBudget: number;
  weeklyVariancePercentage: number;
}

export function WeeklyBudgetCard({ 
  weekLabel, 
  weeklyPlannedBudget, 
  weeklyActualBudget, 
  weeklyVariancePercentage 
}: WeeklyBudgetCardProps) {
  return (
    <BudgetCard 
      title={`Budget Semaine ${weekLabel}`}
      icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Prévu</p>
          <div className="text-lg font-bold">{formatCurrency(weeklyPlannedBudget)}</div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Dépensé</p>
          <div 
            className={`text-lg font-bold ${
              weeklyActualBudget > weeklyPlannedBudget ? 'text-red-500' : 
              weeklyActualBudget === weeklyPlannedBudget ? '' : 'text-green-500'
            }`}
          >
            {formatCurrency(weeklyActualBudget)}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
        <div 
          className={`h-1.5 rounded-full ${
            weeklyActualBudget > weeklyPlannedBudget ? 'bg-red-500' : 
            weeklyVariancePercentage < 90 ? 'bg-yellow-400' : 'bg-green-500'
          }`} 
          style={{
            width: `${Math.min(weeklyVariancePercentage, 100)}%`
          }} 
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {weeklyVariancePercentage.toFixed(1)}% du budget prévu
      </p>
    </BudgetCard>
  );
}
