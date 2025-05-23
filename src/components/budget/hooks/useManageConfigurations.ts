
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { WeeklyView } from '@/utils/dateUtils';

export function useManageConfigurations() {
  const { 
    budgetConfigurations,
    activeConfigId,
    addConfiguration,
    deleteConfiguration,
    setActiveConfiguration,
  } = useGlobalBudgetStore();
  
  // States for configuration management
  const [newConfigName, setNewConfigName] = useState('');

  const handleAddConfiguration = (weeks: WeeklyView[]) => {
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

  return {
    newConfigName,
    setNewConfigName,
    budgetConfigurations,
    activeConfigId,
    handleAddConfiguration,
    setActiveConfiguration,
    handleDeleteConfiguration,
  };
}
