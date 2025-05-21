
import { useState, useEffect, useMemo } from 'react';
import { Campaign, WeeklyView, AdSet } from '@/types/campaign';
import { calculateTotalActualBudget, calculateWeeklyAdSetsActualBudget } from '@/utils/budget/calculations';
import { useAdSetStore } from '@/store/adSetStore';

export function useCampaignHeaderData(filteredCampaigns: Campaign[], weeks: WeeklyView[]) {
  // State for selected week
  const [selectedWeekLabel, setSelectedWeekLabel] = useState<string | null>(null);
  // Récupérer le store des ad sets
  const { adSets, fetchAdSets } = useAdSetStore();
  
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

  // Charger les ad sets pour toutes les campagnes
  useEffect(() => {
    // Fetch ad sets for all campaigns
    const loadAdSets = async () => {
      console.log('Loading ad sets for', filteredCampaigns.length, 'campaigns');
      for (const campaign of filteredCampaigns) {
        await fetchAdSets(campaign.id);
      }
    };
    
    if (filteredCampaigns.length > 0) {
      loadAdSets();
    }
  }, [filteredCampaigns, fetchAdSets]);

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

  // Agréger tous les ad sets par campagne
  const allAdSets = useMemo(() => {
    const result: AdSet[] = [];
    
    // Collect all ad sets from all campaigns
    filteredCampaigns.forEach(campaign => {
      const campaignAdSets = adSets[campaign.id] || [];
      result.push(...campaignAdSets);
    });
    
    return result;
  }, [filteredCampaigns, adSets]);

  // Calculate total actual spent budget (sum of all ad sets' actual budgets)
  const totalActualSpent = useMemo(() => {
    console.log('Calculating total actual spent from ad sets:', allAdSets.length);
    
    let total = 0;
    // Aggregate actual budgets from all ad sets
    allAdSets.forEach(adSet => {
      if (adSet.actualBudgets) {
        Object.values(adSet.actualBudgets).forEach(budget => {
          total += Number(budget) || 0;
        });
      }
    });
    
    console.log('Total actual spent calculated from ad sets:', total);
    return total;
  }, [allAdSets]);

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

  // Calculate weekly actual budget from ad sets
  const weeklyActualBudget = useMemo(() => {
    if (!selectedWeekLabel) return 0;
    
    return allAdSets.reduce((sum, adSet) => {
      if (adSet.actualBudgets && adSet.actualBudgets[selectedWeekLabel]) {
        return sum + Number(adSet.actualBudgets[selectedWeekLabel]);
      }
      return sum;
    }, 0);
  }, [allAdSets, selectedWeekLabel]);

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
    unbalancedCampaigns,
    allAdSets
  };
}
