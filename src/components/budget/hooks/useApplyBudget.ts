
import { useState } from 'react';
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
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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
            configPercentages || weeklyPercentages : undefined
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
    isLoading,
    progress,
    handleToggleCampaign,
    setDistributionStrategy,
    handleToggleWeek,
    handleApplyToSelectedCampaigns
  };
}
