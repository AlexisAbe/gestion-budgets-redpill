
import { CampaignState } from '../../types';
import { updateWeeklyBudgetService } from '../../../services';

export const createUpdateWeeklyBudgetSlice = (set: any) => ({
  updateWeeklyBudget: async (campaignId: string, weekLabel: string, amount: number): Promise<void> => {
    try {
      const success = await updateWeeklyBudgetService(campaignId, weekLabel, amount);
      
      if (success) {
        set((state: CampaignState) => {
          // Update campaigns array
          const updatedCampaigns = state.campaigns.map(campaign => {
            if (campaign.id === campaignId) {
              return {
                ...campaign,
                weeklyBudgets: {
                  ...campaign.weeklyBudgets,
                  [weekLabel]: amount
                }
              };
            }
            return campaign;
          });
          
          // Update filteredCampaigns array
          const updatedFilteredCampaigns = state.filteredCampaigns.map(campaign => {
            if (campaign.id === campaignId) {
              return {
                ...campaign,
                weeklyBudgets: {
                  ...campaign.weeklyBudgets,
                  [weekLabel]: amount
                }
              };
            }
            return campaign;
          });
          
          return {
            campaigns: updatedCampaigns,
            filteredCampaigns: updatedFilteredCampaigns
          };
        });
      }
    } catch (error) {
      console.error('Error updating weekly budget:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
});
