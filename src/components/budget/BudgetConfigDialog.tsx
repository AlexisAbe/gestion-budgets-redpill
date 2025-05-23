
import React from 'react';
import { Dialog, DialogContent as DialogContainer, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingIndicator } from './components/LoadingIndicator';
import { DialogNavigation } from './components/DialogNavigation';
import { DialogContent } from './components/DialogContent';
import { BudgetDialogFooter } from './components/DialogFooter';
import { useBudgetConfigDialog } from './hooks/useBudgetConfigDialog';

interface BudgetConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BudgetConfigDialog({ open, onOpenChange }: BudgetConfigDialogProps) {
  const {
    weeks,
    campaigns,
    currentView,
    setCurrentView,
    localPercentages,
    totalPercentage,
    error,
    isLoading,
    progress,
    newConfigName,
    setNewConfigName,
    budgetConfigurations,
    activeConfigId,
    selectedCampaigns,
    distributionStrategy,
    selectedWeeks,
    weekPercentages,
    weekTotalPercentage,
    handlePercentageChange,
    handleEvenDistribution,
    handleSave,
    handleAddConfiguration,
    setActiveConfiguration,
    handleDeleteConfiguration,
    handleToggleCampaign,
    setDistributionStrategy,
    handleToggleWeek,
    handleWeekPercentageChange,
    handleApplyToSelectedCampaigns
  } = useBudgetConfigDialog(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContainer className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Répartition budgétaire</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <LoadingIndicator 
            message={`Application du budget aux campagnes sélectionnées (${Math.round(progress)}%)...`} 
            progress={progress}
          />
        ) : (
          <div className="flex flex-col space-y-6">
            <DialogNavigation 
              currentView={currentView} 
              onViewChange={setCurrentView} 
            />

            <DialogContent
              currentView={currentView}
              // Edit view props
              weeks={weeks}
              localPercentages={localPercentages}
              onPercentageChange={handlePercentageChange}
              onEvenDistribution={handleEvenDistribution}
              totalPercentage={totalPercentage}
              error={error}
              // Manage view props
              newConfigName={newConfigName}
              onNewConfigNameChange={setNewConfigName}
              onAddConfiguration={handleAddConfiguration}
              budgetConfigurations={budgetConfigurations}
              activeConfigId={activeConfigId}
              onSelectConfiguration={setActiveConfiguration}
              onDeleteConfiguration={handleDeleteConfiguration}
              // Apply view props
              campaigns={campaigns}
              selectedCampaigns={selectedCampaigns}
              onToggleCampaign={handleToggleCampaign}
              distributionStrategy={distributionStrategy}
              onStrategyChange={setDistributionStrategy}
              selectedWeeks={selectedWeeks}
              onToggleWeek={handleToggleWeek}
              weekPercentages={weekPercentages}
              onWeekPercentageChange={handleWeekPercentageChange}
              weekTotalPercentage={weekTotalPercentage}
            />
          </div>
        )}
        
        <BudgetDialogFooter
          isLoading={isLoading}
          currentView={currentView}
          onClose={() => onOpenChange(false)}
          onSave={handleSave}
          onApply={handleApplyToSelectedCampaigns}
          totalPercentage={totalPercentage}
          selectedCampaigns={selectedCampaigns}
        />
      </DialogContainer>
    </Dialog>
  );
}
