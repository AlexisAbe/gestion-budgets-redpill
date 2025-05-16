
import { AdSetState } from '../../types/adSetStoreTypes';
import { validateAdSetBudgets, updateAdSetActualBudget } from '../../services/adSet';
import { toast } from 'sonner';

export const createBudgetActions = (set: any, get: () => AdSetState) => ({
  validateBudgets: async (campaignId: string) => {
    return await validateAdSetBudgets(campaignId);
  },
  
  updateActualBudget: async (id: string, weekLabel: string, amount: number) => {
    try {
      const success = await updateAdSetActualBudget(id, weekLabel, amount);
      if (success) {
        // Trouver la campagne associée à cet ad set
        let campaignId: string | null = null;
        
        for (const [cId, adSets] of Object.entries(get().adSets)) {
          const foundAdSet = adSets.find(adSet => adSet.id === id);
          if (foundAdSet) {
            campaignId = cId;
            
            // Mettre à jour l'ad set dans le store avec le nouveau budget réel
            set(state => ({
              adSets: {
                ...state.adSets,
                [cId]: state.adSets[cId].map(adSet => {
                  if (adSet.id === id) {
                    const updatedActualBudgets = { 
                      ...(adSet.actualBudgets || {}), 
                      [weekLabel]: amount 
                    };
                    return { ...adSet, actualBudgets: updatedActualBudgets };
                  }
                  return adSet;
                })
              }
            }));
            
            break;
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error updating ad set actual budget:', error);
      toast.error("Impossible de mettre à jour le budget réel");
      return false;
    }
  }
});
