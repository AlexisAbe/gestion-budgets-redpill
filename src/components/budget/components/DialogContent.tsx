
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ManualDistributionStep } from '../steps/ManualDistributionStep';
import { ManageConfigurationsStep } from '../steps/ManageConfigurationsStep';
import { CampaignSelectionStep } from '../steps/CampaignSelectionStep';
import { StrategySelectionStep } from '../steps/StrategySelectionStep';
import { WeekSelectionStep } from '../steps/WeekSelectionStep';
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils'; // Import WeeklyView instead of Week

interface DialogContentProps {
  currentView: 'edit' | 'manage' | 'apply';
  // Edit view props
  weeks: WeeklyView[]; // Changed from Week[] to WeeklyView[]
  localPercentages: Record<string, number>;
  onPercentageChange: (weekLabel: string, value: string) => void;
  onEvenDistribution: () => void;
  totalPercentage: number;
  error: string;
  // Manage view props
  newConfigName: string;
  onNewConfigNameChange: (value: string) => void;
  onAddConfiguration: () => void;
  budgetConfigurations: Record<string, { name: string; percentages: Record<string, number> }>;
  activeConfigId: string | null;
  onSelectConfiguration: (id: string) => void;
  onDeleteConfiguration: (id: string) => void;
  // Apply view props
  campaigns: Campaign[];
  selectedCampaigns: string[];
  onToggleCampaign: (campaignId: string) => void;
  distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global';
  onStrategyChange: (strategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global') => void;
  selectedWeeks: string[];
  onToggleWeek: (weekLabel: string) => void;
  weekPercentages?: Record<string, number>;
  onWeekPercentageChange?: (weekLabel: string, percentage: number) => void;
  weekTotalPercentage?: number;
}

export function DialogContent({ 
  currentView,
  weeks,
  localPercentages,
  onPercentageChange,
  onEvenDistribution,
  totalPercentage,
  error,
  newConfigName,
  onNewConfigNameChange,
  onAddConfiguration,
  budgetConfigurations,
  activeConfigId,
  onSelectConfiguration,
  onDeleteConfiguration,
  campaigns,
  selectedCampaigns,
  onToggleCampaign,
  distributionStrategy,
  onStrategyChange,
  selectedWeeks,
  onToggleWeek,
  weekPercentages = {},
  onWeekPercentageChange,
  weekTotalPercentage = 0
}: DialogContentProps) {
  return (
    <ScrollArea className="h-[400px]">
      {currentView === 'edit' && (
        <ManualDistributionStep 
          weeks={weeks}
          percentages={localPercentages}
          onPercentageChange={onPercentageChange}
          onEvenDistribution={onEvenDistribution}
          totalPercentage={totalPercentage}
          error={error}
        />
      )}
      
      {currentView === 'manage' && (
        <ManageConfigurationsStep
          newConfigName={newConfigName}
          onNewConfigNameChange={onNewConfigNameChange}
          onAddConfiguration={onAddConfiguration}
          budgetConfigurations={budgetConfigurations}
          activeConfigId={activeConfigId}
          onSelectConfiguration={onSelectConfiguration}
          onDeleteConfiguration={onDeleteConfiguration}
        />
      )}
      
      {currentView === 'apply' && (
        <div className="space-y-6">
          <CampaignSelectionStep 
            campaigns={campaigns}
            selectedCampaigns={selectedCampaigns}
            onToggleCampaign={onToggleCampaign}
          />
          <StrategySelectionStep 
            distributionStrategy={distributionStrategy}
            onStrategyChange={onStrategyChange}
            activeConfigId={activeConfigId}
            budgetConfigurations={budgetConfigurations}
            onSelectConfiguration={onSelectConfiguration}
          />
          <WeekSelectionStep 
            weeks={weeks}
            selectedWeeks={selectedWeeks}
            onToggleWeek={onToggleWeek}
            weekPercentages={weekPercentages}
            onPercentageChange={onWeekPercentageChange}
            totalPercentage={weekTotalPercentage}
          />
        </div>
      )}
    </ScrollArea>
  );
}
