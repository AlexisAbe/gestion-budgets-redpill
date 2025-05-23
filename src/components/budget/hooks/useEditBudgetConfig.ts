
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { WeeklyView } from '@/utils/dateUtils';

export function useEditBudgetConfig() {
  const { 
    weeklyPercentages, 
    setWeeklyPercentages, 
    initializeDefaultPercentages,
    activeConfigId,
    updateConfiguration,
  } = useGlobalBudgetStore();

  // States for editing
  const [localPercentages, setLocalPercentages] = useState<Record<string, number>>({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [error, setError] = useState('');
  
  // Initialize percentages if needed
  useEffect(() => {
    initializeDefaultPercentages();
  }, [initializeDefaultPercentages]);

  // When dialog opens, initialize local state with current percentages
  useEffect(() => {
    setLocalPercentages({...weeklyPercentages});
    calculateTotal({...weeklyPercentages});
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

  const handleEvenDistribution = (weeks: WeeklyView[]) => {
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

  const handleSave = (onClose: () => void) => {
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

  return {
    localPercentages,
    totalPercentage,
    error,
    handlePercentageChange,
    handleEvenDistribution,
    handleSave,
  };
}
