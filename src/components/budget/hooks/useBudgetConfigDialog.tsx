
import { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { useEditBudgetConfig } from './useEditBudgetConfig';
import { useManageConfigurations } from './useManageConfigurations';
import { useApplyBudget } from './useApplyBudget';

export function useBudgetConfigDialog(onClose: () => void) {
  const { weeks, campaigns, fetchCampaigns } = useCampaignStore();
  
  // Ensure campaigns are fetched when the dialog opens
  useState(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  
  // Current view state
  const [currentView, setCurrentView] = useState<'edit' | 'manage' | 'apply'>('edit');

  // Use the smaller hooks
  const editBudgetConfig = useEditBudgetConfig();
  const manageConfigurations = useManageConfigurations();
  const applyBudget = useApplyBudget(onClose);

  // Adapter methods to maintain API compatibility
  const handleEvenDistributionWrapper = () => editBudgetConfig.handleEvenDistribution(weeks);
  const handleAddConfigurationWrapper = () => manageConfigurations.handleAddConfiguration(weeks);
  const handleSaveWrapper = () => editBudgetConfig.handleSave(onClose);

  return {
    // Data
    weeks,
    campaigns,
    
    // View state
    currentView,
    setCurrentView,
    
    // Edit state and methods
    localPercentages: editBudgetConfig.localPercentages,
    totalPercentage: editBudgetConfig.totalPercentage,
    error: editBudgetConfig.error,
    handlePercentageChange: editBudgetConfig.handlePercentageChange,
    handleEvenDistribution: handleEvenDistributionWrapper,
    handleSave: handleSaveWrapper,
    
    // Manage state and methods
    newConfigName: manageConfigurations.newConfigName,
    setNewConfigName: manageConfigurations.setNewConfigName,
    budgetConfigurations: manageConfigurations.budgetConfigurations,
    activeConfigId: manageConfigurations.activeConfigId,
    handleAddConfiguration: handleAddConfigurationWrapper,
    setActiveConfiguration: manageConfigurations.setActiveConfiguration,
    handleDeleteConfiguration: manageConfigurations.handleDeleteConfiguration,
    
    // Apply state and methods
    selectedCampaigns: applyBudget.selectedCampaigns,
    distributionStrategy: applyBudget.distributionStrategy,
    selectedWeeks: applyBudget.selectedWeeks,
    isLoading: applyBudget.isLoading,
    progress: applyBudget.progress,
    handleToggleCampaign: applyBudget.handleToggleCampaign,
    setDistributionStrategy: applyBudget.setDistributionStrategy,
    handleToggleWeek: applyBudget.handleToggleWeek,
    handleApplyToSelectedCampaigns: applyBudget.handleApplyToSelectedCampaigns
  };
}
