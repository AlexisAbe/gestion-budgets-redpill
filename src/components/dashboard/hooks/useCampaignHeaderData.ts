
import { useState, useEffect, useMemo } from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';

export function useCampaignHeaderData(filteredCampaigns: Campaign[], weeks: WeeklyView[]) {
  // State for selected week
  const [selectedWeekLabel, setSelectedWeekLabel] = useState<string | null>(null);
  
  // Find current week based on today's date
  useEffect(() => {
    const today = new Date();
    const currentWeek = weeks.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return today >= startDate && today <= endDate;
    });
    
    if (currentWeek) {
      setSelectedWeekLabel(currentWeek.weekLabel);
    } else if (weeks.length > 0) {
      // If today is not in any week range, default to first week
      setSelectedWeekLabel(weeks[0].weekLabel);
    }
  }, [weeks]);

  // Calculate total planned budget (sum of all campaign totalBudgets)
  const totalPlannedBudget = useMemo(() => 
    filteredCampaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0),
    [filteredCampaigns]
  );

  // Calculate total allocated budget (sum of all weekly budgets across all campaigns)
  const totalAllocatedBudget = useMemo(() => 
    filteredCampaigns.reduce((sum, campaign) => {
      return sum + Object.values(campaign.weeklyBudgets).reduce((weeklySum, budget) => weeklySum + (budget || 0), 0);
    }, 0),
    [filteredCampaigns]
  );

  // Calculate allocation difference and percentage
  const allocationDifference = totalPlannedBudget - totalAllocatedBudget;
  const allocationPercentage = totalPlannedBudget > 0 ? (totalAllocatedBudget / totalPlannedBudget) * 100 : 0;
  
  // Determine if allocation is balanced (within 1% margin)
  const isBalanced = Math.abs(allocationPercentage - 100) < 1;

  // Calculate total actual spent budget (sum of all actual budgets)
  const totalActualSpent = useMemo(() => 
    filteredCampaigns.reduce((sum, campaign) => {
      if (campaign.actualBudgets) {
        return sum + Object.values(campaign.actualBudgets).reduce((weekSum, budget) => weekSum + (budget || 0), 0);
      }
      return sum;
    }, 0),
    [filteredCampaigns]
  );

  // Calculate planned and actual budgets for the selected week
  const weeklyPlannedBudget = useMemo(() => 
    filteredCampaigns.reduce((sum, campaign) => {
      if (selectedWeekLabel && campaign.weeklyBudgets && campaign.weeklyBudgets[selectedWeekLabel]) {
        return sum + campaign.weeklyBudgets[selectedWeekLabel];
      }
      return sum;
    }, 0),
    [filteredCampaigns, selectedWeekLabel]
  );

  const weeklyActualBudget = useMemo(() => 
    filteredCampaigns.reduce((sum, campaign) => {
      if (selectedWeekLabel && campaign.actualBudgets && campaign.actualBudgets[selectedWeekLabel]) {
        return sum + campaign.actualBudgets[selectedWeekLabel];
      }
      return sum;
    }, 0),
    [filteredCampaigns, selectedWeekLabel]
  );

  // Calculate budget variance for selected week
  const weeklyVariance = weeklyPlannedBudget - weeklyActualBudget;
  const weeklyVariancePercentage = weeklyPlannedBudget > 0 
    ? (weeklyActualBudget / weeklyPlannedBudget) * 100 
    : 0;

  // Calculate percentage of actual spent compared to planned
  const percentageSpent = totalPlannedBudget > 0 ? totalActualSpent / totalPlannedBudget * 100 : 0;

  // Count campaigns with balanced budget for the selected client
  const balancedCampaigns = filteredCampaigns.filter(campaign => {
    const weeklySum = Object.values(campaign.weeklyBudgets).reduce((sum, budget) => sum + (budget || 0), 0);
    return Math.abs(weeklySum - campaign.totalBudget) < 0.01;
  }).length;

  // Count campaigns with unbalanced budget for the selected client
  const unbalancedCampaigns = filteredCampaigns.length - balancedCampaigns;

  return {
    selectedWeekLabel,
    setSelectedWeekLabel,
    totalPlannedBudget,
    totalAllocatedBudget,
    allocationDifference,
    allocationPercentage,
    isBalanced,
    totalActualSpent,
    weeklyPlannedBudget,
    weeklyActualBudget,
    weeklyVariancePercentage,
    percentageSpent,
    balancedCampaigns,
    unbalancedCampaigns
  };
}
