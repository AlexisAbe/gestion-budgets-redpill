
import { useMemo } from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { calculateTotalBudget, calculateAllocatedBudget, calculateActualSpend } from '@/utils/budget/calculations';

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
