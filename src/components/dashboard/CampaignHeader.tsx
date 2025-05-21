
import React from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { 
  TotalBudgetCard, 
  AllocationCard, 
  ActualSpendCard, 
  WeeklyBudgetCard, 
  WeekSelector 
} from './budget-cards';
import { useCampaignHeaderData } from './hooks/useCampaignHeaderData';

export function CampaignHeader() {
  // Use filteredCampaigns (which are already filtered by client) instead of all campaigns
  const { filteredCampaigns, weeks } = useCampaignStore();

  const { 
    selectedWeekLabel,
    setSelectedWeekLabel,
    selectedWeeks,
    totalPlannedBudget,
    totalAllocatedBudget,
    allocationDifference,
    allocationPercentage,
    isBalanced,
    totalActualSpent,
    weeklyPlannedBudget,
    weeklyActualBudget,
    weeklyVariancePercentage,
    percentageSpent
  } = useCampaignHeaderData(filteredCampaigns, weeks);
  
  return (
    <div className="w-full mb-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aperçu des Campagnes</h2>
        <div className="flex items-center gap-2">
          <WeekSelector
            weeks={weeks}
            selectedWeekLabel={selectedWeekLabel}
            onSelect={(value) => setSelectedWeekLabel(value)}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalBudgetCard 
          totalPlannedBudget={totalPlannedBudget}
          campaignsCount={filteredCampaigns.length}
        />
        
        <AllocationCard 
          totalAllocatedBudget={totalAllocatedBudget}
          allocationDifference={allocationDifference}
          allocationPercentage={allocationPercentage}
          isBalanced={isBalanced}
        />

        <ActualSpendCard 
          totalActualSpent={totalActualSpent}
          percentageSpent={percentageSpent}
          selectedWeeks={selectedWeeks}
        />

        {selectedWeekLabel && (
          <WeeklyBudgetCard 
            weekLabel={selectedWeekLabel}
            weeklyPlannedBudget={weeklyPlannedBudget}
            weeklyActualBudget={weeklyActualBudget}
            weeklyVariancePercentage={weeklyVariancePercentage}
          />
        )}
      </div>
    </div>
  );
}
