
import { AdSetState } from '../types';
import { updateAdSetActualBudgetService } from '../../services';

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
        Object.entries(get().adSets).forEach(([campaignId, adSets]) => {
          const adSetIndex = adSets.findIndex(adSet => adSet.id === adSetId);
          
          if (adSetIndex !== -1) {
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
                  [campaignId]: updatedAdSets
                }
              };
            });
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error updating actual budget in store:', error);
      return false;
    }
  }
});

export type BudgetAdSetsSlice = ReturnType<typeof createBudgetAdSetsSlice>;
