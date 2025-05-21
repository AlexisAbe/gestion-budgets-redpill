
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
  // Détermine si le budget hebdomadaire est dépassé
  const isBudgetOverspent = weeklyActualBudget > weeklyPlannedBudget;
  const isBudgetWithinLimit = weeklyActualBudget > 0 && weeklyActualBudget <= weeklyPlannedBudget * 0.98;
  
  // Calcule la différence en pourcentage pour l'affichage
  const percentageDifference = weeklyPlannedBudget > 0 
    ? Math.abs(((weeklyActualBudget / weeklyPlannedBudget) - 1) * 100)
    : 0;

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
              isBudgetOverspent ? 'text-red-500' : 
              isBudgetWithinLimit ? 'text-green-500' : ''
            }`}
          >
            {formatCurrency(weeklyActualBudget)}
            {weeklyActualBudget > 0 && (
              <span 
                className={`ml-1 text-[10px] px-1 py-0.5 rounded ${
                  isBudgetOverspent 
                    ? 'bg-red-100 text-red-600'
                    : isBudgetWithinLimit
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                }`}
              >
                {isBudgetOverspent ? '+' : ''}{percentageDifference.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
        <div 
          className={`h-1.5 rounded-full ${
            isBudgetOverspent ? 'bg-red-500' : 
            weeklyVariancePercentage < 90 ? 'bg-yellow-400' : 'bg-green-500'
          }`} 
          style={{
            width: `${Math.min(weeklyVariancePercentage, 100)}%`
          }} 
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {weeklyVariancePercentage.toFixed(1)}% du budget prévu pour cette semaine
      </p>
    </BudgetCard>
  );
}
