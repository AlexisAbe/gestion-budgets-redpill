import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { useCampaignStore } from '@/store/campaignStore';
import { Campaign } from '@/types/campaign';

export function useApplyBudget(onClose: () => void) {
  const { 
    weeklyPercentages,
    budgetConfigurations,
    activeConfigId,
  } = useGlobalBudgetStore();
  
  const { autoDistributeBudget } = useCampaignStore();
  
  // States for campaign application
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [distributionStrategy, setDistributionStrategy] = useState<'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global'>('manual');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  
  // Nouvel état pour les pourcentages par semaine
  const [weekPercentages, setWeekPercentages] = useState<Record<string, number>>({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Recalculer le total des pourcentages quand les pourcentages changent
  useEffect(() => {
    const total = selectedWeeks.reduce((sum, weekLabel) => sum + (weekPercentages[weekLabel] || 0), 0);
    setTotalPercentage(total);
  }, [weekPercentages, selectedWeeks]);

  // Mise à jour des pourcentages quand la sélection de semaines change
  useEffect(() => {
    if (selectedWeeks.length > 0) {
      // Conserver uniquement les semaines sélectionnées
      const filteredPercentages: Record<string, number> = {};
      selectedWeeks.forEach(weekLabel => {
        filteredPercentages[weekLabel] = weekPercentages[weekLabel] || 0;
      });
      setWeekPercentages(filteredPercentages);
      
      // Distribution égale par défaut lors de l'ajout/suppression de semaines
      if (selectedWeeks.length !== Object.keys(filteredPercentages).filter(key => filteredPercentages[key] > 0).length) {
        const evenPercentage = Math.floor(100 / selectedWeeks.length);
        const remainder = 100 - (evenPercentage * selectedWeeks.length);
        
        const evenDistribution: Record<string, number> = {};
        selectedWeeks.forEach((weekLabel, index) => {
          if (index === selectedWeeks.length - 1) {
            evenDistribution[weekLabel] = evenPercentage + remainder;
          } else {
            evenDistribution[weekLabel] = evenPercentage;
          }
        });
        setWeekPercentages(evenDistribution);
      }
    } else {
      setWeekPercentages({});
      setTotalPercentage(0);
    }
  }, [selectedWeeks]);

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
  
  const handlePercentageChange = (weekLabel: string, percentage: number) => {
    setWeekPercentages(prev => ({
      ...prev,
      [weekLabel]: percentage
    }));
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
    
    // Vérification des pourcentages si des semaines sont sélectionnées
    if (selectedWeeks.length > 0 && totalPercentage !== 100) {
      toast({
        title: "Erreur",
        description: `Le total des pourcentages doit être égal à 100%. Actuellement: ${totalPercentage}%`,
        variant: "destructive"
      });
      return;
    }

    // Start loading state
    setIsLoading(true);
    setProgress(0);
    
    // Get the percentages from the active configuration or from selected weeks
    let configPercentages: Record<string, number> | undefined;
    
    if (distributionStrategy === 'global') {
      configPercentages = budgetConfigurations[activeConfigId]?.percentages || {};
    } else if (distributionStrategy === 'manual' && selectedWeeks.length > 0) {
      configPercentages = weekPercentages;
    } else {
      configPercentages = weeklyPercentages;
    }
    
    // Apply to each selected campaign
    const totalCampaigns = selectedCampaigns.length;
    
    for (let i = 0; i < selectedCampaigns.length; i++) {
      const campaignId = selectedCampaigns[i];
      
      try {
        // Fix: Adjust parameters to match the autoDistributeBudget function signature
        // Checking the implementation in store/actions/budgetActions.ts, it expects:
        // (campaignId, distributionStrategy, percentages?)
        await autoDistributeBudget(
          campaignId,
          distributionStrategy,
          configPercentages
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
    selectedCampaigns,
    distributionStrategy,
    selectedWeeks,
    weekPercentages,
    totalPercentage,
    isLoading,
    progress,
    handleToggleCampaign,
    setDistributionStrategy,
    handleToggleWeek,
    handlePercentageChange,
    handleApplyToSelectedCampaigns
  };
}
