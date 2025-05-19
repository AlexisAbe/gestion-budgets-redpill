
import { toast } from '@/hooks/use-toast';
import { StateCreator } from 'zustand';
import { validateAdSetBudgets, updateAdSetActualBudget } from '../../services/adSet';
import { AdSetState } from '../types';

export interface BudgetAdSetsSlice {
  validateBudgets: (campaignId: string) => Promise<{ valid: boolean, total: number }>;
  updateActualBudget: (id: string, weekLabel: string, amount: number) => Promise<boolean>;
}

export const createBudgetAdSetsSlice: StateCreator<
  AdSetState, 
  [], 
  [], 
  BudgetAdSetsSlice
> = (set, get) => ({
  validateBudgets: async (campaignId: string) => {
    return await validateAdSetBudgets(campaignId);
  },
  
  updateActualBudget: async (id: string, weekLabel: string, amount: number) => {
    set({ isLoading: true });
    try {
      const success = await updateAdSetActualBudget(id, weekLabel, amount);
      if (success) {
        // Find campaign associated with this ad set
        let campaignId: string | null = null;
        let adSetName: string = '';
        
        for (const [cId, adSets] of Object.entries(get().adSets)) {
          const foundAdSet = adSets.find(adSet => adSet.id === id);
          if (foundAdSet) {
            campaignId = cId;
            adSetName = foundAdSet.name;
            
            // Update ad set in store with new actual budget
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
              },
              isLoading: false
            }));
            
            break;
          }
        }
      } else {
        set({ isLoading: false });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating ad set actual budget:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le budget réel",
        variant: "destructive"
      });
      set({ isLoading: false });
      return false;
    }
  }
});
