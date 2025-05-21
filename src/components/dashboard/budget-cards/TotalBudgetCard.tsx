
import React from 'react';
import { BudgetCard } from './BudgetCard';
import { formatCurrency } from '@/utils/budget';
import { Euro } from 'lucide-react';

interface TotalBudgetCardProps {
  totalPlannedBudget: number;
  campaignsCount: number;
}

export function TotalBudgetCard({ totalPlannedBudget, campaignsCount }: TotalBudgetCardProps) {
  return (
    <BudgetCard 
      title="Budget Total Prévu"
      icon={<Euro className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="text-2xl font-bold">{formatCurrency(totalPlannedBudget)}</div>
      <p className="text-xs text-muted-foreground">
        Réparti sur {campaignsCount} campagne{campaignsCount !== 1 ? 's' : ''}
      </p>
    </BudgetCard>
  );
}
