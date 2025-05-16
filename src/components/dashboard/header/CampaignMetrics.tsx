
import React from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/budgetUtils';
import { Campaign } from '@/types/campaign';
import { MetricCard } from './MetricCard';

interface CampaignMetricsProps {
  filteredCampaigns: Campaign[];
  selectedWeekLabel: string | null;
  weeklyPlannedBudget: number;
  weeklyActualBudget: number;
  weeklyVariancePercentage: number;
  totalPlannedBudget: number;
  totalAllocatedBudget: number;
  allocationDifference: number;
  allocationPercentage: number;
  isBalanced: boolean;
  totalActualSpent: number;
  percentageSpent: number;
}

export function CampaignMetrics({
  filteredCampaigns,
  selectedWeekLabel,
  weeklyPlannedBudget,
  weeklyActualBudget,
  weeklyVariancePercentage,
  totalPlannedBudget,
  totalAllocatedBudget,
  allocationDifference,
  allocationPercentage,
  isBalanced,
  totalActualSpent,
  percentageSpent
}: CampaignMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Budget Card */}
      <MetricCard 
        title="Budget Total Prévu"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
      >
        <div className="text-2xl font-bold">{formatCurrency(totalPlannedBudget)}</div>
        <p className="text-xs text-muted-foreground">
          Réparti sur {filteredCampaigns.length} campagne{filteredCampaigns.length !== 1 ? 's' : ''}
        </p>
      </MetricCard>
      
      {/* Budget Allocation Card */}
      <MetricCard 
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
      </MetricCard>

      {/* Actual Budget Card */}
      <MetricCard
        title="Budget Réel Dépensé"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        }
      >
        <div className="text-2xl font-bold">{formatCurrency(totalActualSpent)}</div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
          <div className={`h-1.5 rounded-full ${percentageSpent < 90 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{
          width: `${Math.min(percentageSpent, 100)}%`
        }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {percentageSpent.toFixed(1)}% du budget total prévu
        </p>
      </MetricCard>

      {/* Weekly Budget Card */}
      <MetricCard
        title={`Budget Semaine ${selectedWeekLabel}`}
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
      </MetricCard>
    </div>
  );
}
