
import React from 'react';
import { BudgetCard } from './BudgetCard';
import { formatCurrency } from '@/utils/budget';

interface TotalBudgetCardProps {
  totalPlannedBudget: number;
  campaignsCount: number;
}

export function TotalBudgetCard({ totalPlannedBudget, campaignsCount }: TotalBudgetCardProps) {
  return (
    <BudgetCard 
      title="Budget Total Prévu"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      }
    >
      <div className="text-2xl font-bold">{formatCurrency(totalPlannedBudget)}</div>
      <p className="text-xs text-muted-foreground">
        Réparti sur {campaignsCount} campagne{campaignsCount !== 1 ? 's' : ''}
      </p>
    </BudgetCard>
  );
}
