
import { useState, useEffect, useMemo } from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { calculateTotalActualBudget } from '@/utils/budget/calculations';

export function useCampaignHeaderData(filteredCampaigns: Campaign[], weeks: WeeklyView[]) {
  // State for selected week
  const [selectedWeekLabel, setSelectedWeekLabel] = useState<string | null>(null);
  
  // Track selected weeks for cumulative calculations
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  
  // Find current week based on today's date and set initial selected weeks
  useEffect(() => {
    const today = new Date();
    const currentWeek = weeks.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return today >= startDate && today <= endDate;
    });
    
    if (currentWeek) {
      setSelectedWeekLabel(currentWeek.weekLabel);
      
      // Set visible weeks based on current week (current week + previous week)
      const currentWeekIndex = weeks.findIndex(w => w.weekLabel === currentWeek.weekLabel);
      const visibleWeeks = [];
      
      if (currentWeekIndex > 0) {
        visibleWeeks.push(weeks[currentWeekIndex - 1].weekLabel);
      }
      
      visibleWeeks.push(currentWeek.weekLabel);
      setSelectedWeeks(visibleWeeks);
      
    } else if (weeks.length > 0) {
      // If today is not in any week range, default to first week
      setSelectedWeekLabel(weeks[0].weekLabel);
      setSelectedWeeks([weeks[0].weekLabel]);
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

  // Calculate total actual spent budget for selected weeks only
  const totalActualSpent = useMemo(() => 
    filteredCampaigns.reduce((sum, campaign) => {
      if (!campaign.actualBudgets) return sum;
      
      // Sum only the budgets for selected weeks
      return sum + selectedWeeks.reduce((weekSum, weekLabel) => {
        const weekBudget = campaign.actualBudgets?.[weekLabel] || 0;
        return weekSum + weekBudget;
      }, 0);
    }, 0),
    [filteredCampaigns, selectedWeeks]
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
    selectedWeeks,
    setSelectedWeeks,
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
