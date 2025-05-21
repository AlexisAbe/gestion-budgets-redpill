
import { AdSetState } from '../types';
import { updateAdSetActualBudgetService } from '../../services';
import { syncAdSetsActualBudgetsForWeek } from '@/features/campaigns/services/budgetServices';

export const createBudgetAdSetsSlice = (set: any, get: () => AdSetState) => ({
  validateBudgets: async (campaignId: string): Promise<{ valid: boolean, total: number }> => {
    const campaignAdSets = get().adSets[campaignId] || [];
    
    const totalPercentage = campaignAdSets.reduce(
      (sum, adSet) => sum + adSet.budgetPercentage, 0
    );
    
    // Valid if the total is exactly 100% or if there are no ad sets
    const valid = campaignAdSets.length === 0 || Math.abs(totalPercentage - 100) < 0.01;
    
    return {
      valid,
      total: totalPercentage
    };
  },
  
  updateActualBudget: async (adSetId: string, weekLabel: string, amount: number): Promise<boolean> => {
    try {
      const result = await updateAdSetActualBudgetService(adSetId, weekLabel, amount);
      
      if (result) {
        // Find the campaign ID and ad set to update
        let campaignId: string | null = null;
        
        Object.entries(get().adSets).forEach(([cId, adSets]) => {
          const adSetIndex = adSets.findIndex(adSet => adSet.id === adSetId);
          
          if (adSetIndex !== -1) {
            campaignId = cId;
            
            // Update the store
            set((state: AdSetState) => {
              const updatedAdSets = [...adSets];
              
              // Update or create actualBudgets object if needed
              updatedAdSets[adSetIndex] = {
                ...updatedAdSets[adSetIndex],
                actualBudgets: {
                  ...(updatedAdSets[adSetIndex].actualBudgets || {}),
                  [weekLabel]: amount
                }
              };
              
              return {
                adSets: {
                  ...state.adSets,
                  [cId]: updatedAdSets
                }
              };
            });
          }
        });
        
        // Synchroniser avec la campagne parent
        if (campaignId) {
          await syncAdSetsActualBudgetsForWeek(campaignId, weekLabel);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error updating actual budget in store:', error);
      return false;
    }
  },
  
  // Add the missing updateAdSetActualBudget function to match the interface
  updateAdSetActualBudget: (adSetId: string, weekLabel: string, amount: number): void => {
    // This is a synchronous wrapper around updateActualBudget
    get().updateActualBudget(adSetId, weekLabel, amount);
  }
});

export type BudgetAdSetsSlice = ReturnType<typeof createBudgetAdSetsSlice>;
