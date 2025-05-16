
import React, { useState, useEffect } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { CampaignWeekSelector } from './CampaignWeekSelector';
import { CampaignMetrics } from './CampaignMetrics';

export function CampaignHeader() {
  // Use filteredCampaigns (which are already filtered by client) instead of all campaigns
  const { filteredCampaigns, weeks } = useCampaignStore();

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
  const totalPlannedBudget = filteredCampaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);

  // Calculate total allocated budget (sum of all weekly budgets across all campaigns)
  const totalAllocatedBudget = filteredCampaigns.reduce((sum, campaign) => {
    return sum + Object.values(campaign.weeklyBudgets).reduce((weeklySum, budget) => weeklySum + (budget || 0), 0);
  }, 0);

  // Calculate allocation difference and percentage
  const allocationDifference = totalPlannedBudget - totalAllocatedBudget;
  const allocationPercentage = totalPlannedBudget > 0 ? (totalAllocatedBudget / totalPlannedBudget) * 100 : 0;
  
  // Determine if allocation is balanced (within 1% margin)
  const isBalanced = Math.abs(allocationPercentage - 100) < 1;

  // Calculate total actual spent budget (sum of all actual budgets)
  const totalActualSpent = filteredCampaigns.reduce((sum, campaign) => {
    if (campaign.actualBudgets) {
      return sum + Object.values(campaign.actualBudgets).reduce((weekSum, budget) => weekSum + (budget || 0), 0);
    }
    return sum;
  }, 0);

  // Calculate planned and actual budgets for the selected week
  const weeklyPlannedBudget = filteredCampaigns.reduce((sum, campaign) => {
    if (selectedWeekLabel && campaign.weeklyBudgets && campaign.weeklyBudgets[selectedWeekLabel]) {
      return sum + campaign.weeklyBudgets[selectedWeekLabel];
    }
    return sum;
  }, 0);

  const weeklyActualBudget = filteredCampaigns.reduce((sum, campaign) => {
    if (selectedWeekLabel && campaign.actualBudgets && campaign.actualBudgets[selectedWeekLabel]) {
      return sum + campaign.actualBudgets[selectedWeekLabel];
    }
    return sum;
  }, 0);

  // Calculate budget variance for selected week
  const weeklyVariancePercentage = weeklyPlannedBudget > 0 
    ? (weeklyActualBudget / weeklyPlannedBudget) * 100 
    : 0;

  // Calculate percentage of actual spent compared to planned
  const percentageSpent = totalPlannedBudget > 0 ? totalActualSpent / totalPlannedBudget * 100 : 0;

  return (
    <div className="w-full mb-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aperçu des Campagnes</h2>
        <div className="flex items-center gap-2">
          <CampaignWeekSelector 
            weeks={weeks}
            selectedWeekLabel={selectedWeekLabel}
            onWeekChange={(value) => setSelectedWeekLabel(value)}
          />
        </div>
      </div>
      
      <CampaignMetrics 
        filteredCampaigns={filteredCampaigns}
        selectedWeekLabel={selectedWeekLabel}
        weeklyPlannedBudget={weeklyPlannedBudget}
        weeklyActualBudget={weeklyActualBudget}
        weeklyVariancePercentage={weeklyVariancePercentage}
        totalPlannedBudget={totalPlannedBudget}
        totalAllocatedBudget={totalAllocatedBudget}
        allocationDifference={allocationDifference}
        allocationPercentage={allocationPercentage}
        isBalanced={isBalanced}
        totalActualSpent={totalActualSpent}
        percentageSpent={percentageSpent}
      />
    </div>
  );
}
