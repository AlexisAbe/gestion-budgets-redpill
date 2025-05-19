
import React from 'react';
import { BudgetCard } from './BudgetCard';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/budget';

interface AllocationCardProps {
  totalAllocatedBudget: number;
  allocationDifference: number;
  allocationPercentage: number;
  isBalanced: boolean;
}

export function AllocationCard({ 
  totalAllocatedBudget, 
  allocationDifference, 
  allocationPercentage, 
  isBalanced 
}: AllocationCardProps) {
  return (
    <BudgetCard 
      title="Allocation Budget"
      icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      className={`${isBalanced ? 'border-green-500/30' : 'border-red-500/30'}`}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Planifié</p>
          <div className="text-lg font-bold">{formatCurrency(totalAllocatedBudget)}</div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Différence</p>
          <div 
            className={`text-lg font-bold ${
              isBalanced ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {formatCurrency(allocationDifference)}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
        <div 
          className={`h-1.5 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`} 
          style={{
            width: `${Math.min(allocationPercentage, 100)}%`
          }} 
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {allocationPercentage.toFixed(1)}% du budget total alloué
        {!isBalanced && (
          <span className={`ml-1 ${allocationDifference > 0 ? 'text-red-500' : 'text-orange-500'}`}>
            ({allocationDifference > 0 ? 'non alloué' : 'sur-alloué'})
          </span>
        )}
      </p>
    </BudgetCard>
  );
}
