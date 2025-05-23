
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { CampaignSelectionStep } from './steps/CampaignSelectionStep';
import { StrategySelectionStep } from './steps/StrategySelectionStep';
import { WeekSelectionStep } from './steps/WeekSelectionStep';
import { ManualDistributionStep } from './steps/ManualDistributionStep';
import { ManageConfigurationsStep } from './steps/ManageConfigurationsStep';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { useCampaignStore } from '@/store/campaignStore';

interface BudgetConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BudgetConfigDialog({ open, onOpenChange }: BudgetConfigDialogProps) {
  const { 
    weeklyPercentages, 
    setWeeklyPercentages, 
    initializeDefaultPercentages,
    budgetConfigurations,
    activeConfigId,
    addConfiguration,
    deleteConfiguration,
    updateConfiguration,
    setActiveConfiguration
  } = useGlobalBudgetStore();
  
  const { weeks, campaigns, autoDistributeBudget } = useCampaignStore();
  
  // States for the dialog
  const [currentView, setCurrentView] = useState<'edit' | 'manage' | 'apply'>('edit');
  const [localPercentages, setLocalPercentages] = useState<Record<string, number>>({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [error, setError] = useState('');
  
  // States for configuration management
  const [newConfigName, setNewConfigName] = useState('');
  
  // States for campaign application
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [distributionStrategy, setDistributionStrategy] = useState<'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global'>('manual');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);

  // Initialize percentages if needed
  useEffect(() => {
    initializeDefaultPercentages();
  }, [initializeDefaultPercentages]);

  // When dialog opens, initialize local state with current percentages
  useEffect(() => {
    if (open) {
      setLocalPercentages({...weeklyPercentages});
      calculateTotal({...weeklyPercentages});
    }
  }, [open, weeklyPercentages]);

  const calculateTotal = (percentages: Record<string, number>) => {
    const total = Object.values(percentages).reduce((sum, val) => sum + (val || 0), 0);
    setTotalPercentage(total);
    
    if (total !== 100) {
      setError(`Le total doit être égal à 100%. Actuellement: ${total}%`);
    } else {
      setError('');
    }
  };

  const handlePercentageChange = (weekLabel: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const newPercentages = { ...localPercentages, [weekLabel]: numValue };
    setLocalPercentages(newPercentages);
    calculateTotal(newPercentages);
  };

  const handleSave = () => {
    if (totalPercentage !== 100) {
      toast({
        title: "Erreur",
        description: `Le total des pourcentages doit être égal à 100%. Actuellement: ${totalPercentage}%`,
        variant: "destructive"
      });
      return;
    }
    
    setWeeklyPercentages(localPercentages);
    
    // If this is for a specific configuration, update it
    if (activeConfigId) {
      updateConfiguration(activeConfigId, {
        percentages: localPercentages
      });
    }
    
    toast({
      title: "Succès",
      description: "Les pourcentages globaux ont été sauvegardés"
    });
    onOpenChange(false);
  };

  const handleEvenDistribution = () => {
    if (weeks.length === 0) return;
    
    const evenPercentage = Math.floor(100 / weeks.length);
    const remainder = 100 - (evenPercentage * weeks.length);
    
    const evenPercentages: Record<string, number> = {};
    weeks.forEach((week, index) => {
      if (index === weeks.length - 1) {
        evenPercentages[week.weekLabel] = evenPercentage + remainder;
      } else {
        evenPercentages[week.weekLabel] = evenPercentage;
      }
    });
    
    setLocalPercentages(evenPercentages);
    calculateTotal(evenPercentages);
  };

  const handleAddConfiguration = () => {
    if (!newConfigName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour la configuration",
        variant: "destructive"
      });
      return;
    }
    
    // Check if name already exists
    const exists = Object.values(budgetConfigurations).some(
      config => config.name.toLowerCase() === newConfigName.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Erreur",
        description: "Une configuration avec ce nom existe déjà",
        variant: "destructive"
      });
      return;
    }
    
    // Create new configuration with even distribution
    const evenPercentage = Math.floor(100 / weeks.length);
    const remainder = 100 - (evenPercentage * weeks.length);
    
    const newPercentages: Record<string, number> = {};
    weeks.forEach((week, index) => {
      if (index === weeks.length - 1) {
        newPercentages[week.weekLabel] = evenPercentage + remainder;
      } else {
        newPercentages[week.weekLabel] = evenPercentage;
      }
    });
    
    addConfiguration(newConfigName, newPercentages);
    
    setNewConfigName('');
    
    toast({
      title: "Succès",
      description: `Configuration "${newConfigName}" créée avec succès`
    });
  };

  const handleDeleteConfiguration = (id: string) => {
    const configName = budgetConfigurations[id]?.name;
    deleteConfiguration(id);
    
    toast({
      title: "Succès",
      description: `Configuration "${configName}" supprimée`
    });
  };

  const handleToggleCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleToggleWeek = (weekLabel: string) => {
    setSelectedWeeks(prev =>
      prev.includes(weekLabel)
        ? prev.filter(week => week !== weekLabel)
        : [...prev, weekLabel]
    );
  };

  const handleApplyToSelectedCampaigns = async () => {
    if (selectedCampaigns.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une campagne",
        variant: "destructive"
      });
      return;
    }

    if (!activeConfigId && distributionStrategy === 'global') {
      toast({
        title: "Erreur",
        description: "Aucune configuration active",
        variant: "destructive"
      });
      return;
    }

    // Get the percentages from the active configuration
    const configPercentages = distributionStrategy === 'global' ? 
      (budgetConfigurations[activeConfigId]?.percentages || {}) : undefined;
    
    // Apply to each selected campaign
    for (const campaignId of selectedCampaigns) {
      try {
        await autoDistributeBudget(
          campaignId,
          distributionStrategy,
          distributionStrategy === 'manual' || distributionStrategy === 'global' ? 
            configPercentages || localPercentages : undefined
        );
      } catch (error) {
        console.error(`Error applying budget to campaign ${campaignId}:`, error);
        toast({
          title: "Erreur",
          description: `Erreur lors de l'application du budget à une campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          variant: "destructive"
        });
      }
    }

    toast({
      title: "Succès",
      description: `Budget appliqué à ${selectedCampaigns.length} campagne(s)`
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Répartition budgétaire</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6">
          {/* Navigation buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={currentView === 'edit' ? 'default' : 'outline'} 
              onClick={() => setCurrentView('edit')}
            >
              Éditer les pourcentages
            </Button>
            <Button 
              variant={currentView === 'manage' ? 'default' : 'outline'} 
              onClick={() => setCurrentView('manage')}
            >
              Gérer les configurations
            </Button>
            <Button 
              variant={currentView === 'apply' ? 'default' : 'outline'} 
              onClick={() => setCurrentView('apply')}
            >
              Appliquer aux campagnes
            </Button>
          </div>

          {/* Content based on current view */}
          <ScrollArea className="h-[400px]">
            {currentView === 'edit' && (
              <ManualDistributionStep 
                weeks={weeks}
                percentages={localPercentages}
                onPercentageChange={handlePercentageChange}
                onEvenDistribution={handleEvenDistribution}
                totalPercentage={totalPercentage}
                error={error}
              />
            )}
            
            {currentView === 'manage' && (
              <ManageConfigurationsStep
                newConfigName={newConfigName}
                onNewConfigNameChange={setNewConfigName}
                onAddConfiguration={handleAddConfiguration}
                budgetConfigurations={budgetConfigurations}
                activeConfigId={activeConfigId}
                onSelectConfiguration={setActiveConfiguration}
                onDeleteConfiguration={handleDeleteConfiguration}
              />
            )}
            
            {currentView === 'apply' && (
              <div className="space-y-6">
                <CampaignSelectionStep 
                  campaigns={campaigns}
                  selectedCampaigns={selectedCampaigns}
                  onToggleCampaign={handleToggleCampaign}
                />
                <StrategySelectionStep 
                  distributionStrategy={distributionStrategy}
                  onStrategyChange={setDistributionStrategy}
                  activeConfigId={activeConfigId}
                  budgetConfigurations={budgetConfigurations}
                  onSelectConfiguration={setActiveConfiguration}
                />
                <WeekSelectionStep 
                  weeks={weeks}
                  selectedWeeks={selectedWeeks}
                  onToggleWeek={handleToggleWeek}
                />
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {currentView === 'edit' && (
            <Button onClick={handleSave} disabled={totalPercentage !== 100}>
              Enregistrer
            </Button>
          )}
          {currentView === 'apply' && (
            <Button 
              onClick={handleApplyToSelectedCampaigns}
              disabled={selectedCampaigns.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
