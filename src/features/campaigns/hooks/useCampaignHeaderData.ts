
import { useMemo } from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { calculateTotalBudget } from '@/utils/budget/calculations';

// Helper functions to replace the missing calculations
function calculateAllocatedBudget(campaigns: Campaign[]): number {
  return campaigns.reduce((sum, campaign) => {
    const weeklySum = Object.values(campaign.weeklyBudgets).reduce((total, amount) => total + (amount || 0), 0);
    return sum + weeklySum;
  }, 0);
}

function calculateActualSpend(campaigns: Campaign[], selectedWeek: string | null): number {
  if (!selectedWeek) return 0;
  
  return campaigns.reduce((sum, campaign) => {
    if (campaign.actualBudgets && campaign.actualBudgets[selectedWeek]) {
      return sum + campaign.actualBudgets[selectedWeek];
    }
    return sum;
  }, 0);
}

export function useCampaignHeaderData(campaigns: Campaign[], selectedWeek: string | null = null) {
  return useMemo(() => {
    const totalBudget = calculateTotalBudget(campaigns);
    const allocatedBudget = calculateAllocatedBudget(campaigns);
    const actualSpend = calculateActualSpend(campaigns, selectedWeek);
    
    const weeklyBudget = selectedWeek 
      ? campaigns.reduce((sum, campaign) => sum + (campaign.weeklyBudgets[selectedWeek] || 0), 0)
      : 0;
      
    const allocationPercentage = totalBudget > 0 
      ? Math.round((allocatedBudget / totalBudget) * 100)
      : 0;
      
    return {
      totalBudget,
      allocatedBudget,
      actualSpend,
      weeklyBudget,
      allocationPercentage,
    };
  }, [campaigns, selectedWeek]);
}
