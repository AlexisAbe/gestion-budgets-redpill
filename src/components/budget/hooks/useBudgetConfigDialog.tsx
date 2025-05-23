
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { useCampaignStore } from '@/store/campaignStore';

export function useBudgetConfigDialog(onClose: () => void) {
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
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
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
    setLocalPercentages({...weeklyPercentages});
    calculateTotal({...weeklyPercentages});
    setIsLoading(false);
    setProgress(0);
  }, [weeklyPercentages]);

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
    onClose();
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

    // Start loading state
    setIsLoading(true);
    setProgress(0);
    
    // Get the percentages from the active configuration
    const configPercentages = distributionStrategy === 'global' ? 
      (budgetConfigurations[activeConfigId]?.percentages || {}) : undefined;
    
    // Apply to each selected campaign
    const totalCampaigns = selectedCampaigns.length;
    
    for (let i = 0; i < selectedCampaigns.length; i++) {
      const campaignId = selectedCampaigns[i];
      
      try {
        await autoDistributeBudget(
          campaignId,
          distributionStrategy,
          distributionStrategy === 'manual' || distributionStrategy === 'global' ? 
            configPercentages || localPercentages : undefined
        );
        // Update progress after each successful application
        const currentProgress = ((i + 1) / totalCampaigns) * 100;
        setProgress(currentProgress);
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
    
    // End loading state
    setIsLoading(false);
    setProgress(0);
    onClose();
  };

  return {
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
    handlePercentageChange,
    handleEvenDistribution,
    handleSave,
    handleAddConfiguration,
    setActiveConfiguration,
    handleDeleteConfiguration,
    handleToggleCampaign,
    setDistributionStrategy,
    handleToggleWeek,
    handleApplyToSelectedCampaigns
  };
}
