
import { CampaignState, GlobalPercentageSettings } from '../types';

export const createGlobalPercentagesSlice = (set: any) => ({
  saveGlobalPercentages: (percentages: GlobalPercentageSettings): void => {
    // Save to localStorage for persistence
    localStorage.setItem('globalBudgetPercentages', JSON.stringify(percentages));
    
    set((state: CampaignState) => ({
      globalPercentages: percentages
    }));
  }
});
