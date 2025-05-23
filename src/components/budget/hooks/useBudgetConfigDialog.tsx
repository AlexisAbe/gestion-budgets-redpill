
import { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { useEditBudgetConfig } from './useEditBudgetConfig';
import { useManageConfigurations } from './useManageConfigurations';
import { useApplyBudget } from './useApplyBudget';

export function useBudgetConfigDialog(onClose: () => void) {
  const { weeks, campaigns } = useCampaignStore();
  
  // Current view state
  const [currentView, setCurrentView] = useState<'edit' | 'manage' | 'apply'>('edit');

  // Combine all the smaller hooks
  const {
    localPercentages,
    totalPercentage,
    error,
    handlePercentageChange,
    handleEvenDistribution,
    handleSave,
  } = useEditBudgetConfig();

  const {
    newConfigName,
    setNewConfigName,
    budgetConfigurations,
    activeConfigId,
    handleAddConfiguration,
    setActiveConfiguration,
    handleDeleteConfiguration,
  } = useManageConfigurations();

  const {
    selectedCampaigns,
    distributionStrategy,
    selectedWeeks,
    isLoading,
    progress,
    handleToggleCampaign,
    setDistributionStrategy,
    handleToggleWeek,
    handleApplyToSelectedCampaigns
  } = useApplyBudget(onClose);

  // Adapter methods to maintain API compatibility
  const handleEvenDistributionWrapper = () => handleEvenDistribution(weeks);
  const handleAddConfigurationWrapper = () => handleAddConfiguration(weeks);
  const handleSaveWrapper = () => handleSave(onClose);

  return {
    // Data
    weeks,
    campaigns,
    
    // View state
    currentView,
    setCurrentView,
    
    // Edit state and methods
    localPercentages,
    totalPercentage,
    error,
    handlePercentageChange,
    handleEvenDistribution: handleEvenDistributionWrapper,
    handleSave: handleSaveWrapper,
    
    // Manage state and methods
    newConfigName,
    setNewConfigName,
    budgetConfigurations,
    activeConfigId,
    handleAddConfiguration: handleAddConfigurationWrapper,
    setActiveConfiguration,
    handleDeleteConfiguration,
    
    // Apply state and methods
    selectedCampaigns,
    distributionStrategy,
    selectedWeeks,
    isLoading,
    progress,
    handleToggleCampaign,
    setDistributionStrategy,
    handleToggleWeek,
    handleApplyToSelectedCampaigns
  };
}
