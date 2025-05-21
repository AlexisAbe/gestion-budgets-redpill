
import { CampaignState } from '../../types';
import { updateActualBudgetService } from '../../../services';

export const createUpdateActualBudgetSlice = (set: any) => ({
  updateActualBudget: async (campaignId: string, weekLabel: string, amount: number): Promise<void> => {
    try {
      const success = await updateActualBudgetService(campaignId, weekLabel, amount);
      
      if (success) {
        set((state: CampaignState) => {
          // Update campaigns array
          const updatedCampaigns = state.campaigns.map(campaign => {
            if (campaign.id === campaignId) {
              return {
                ...campaign,
                actualBudgets: {
                  ...campaign.actualBudgets,
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
                actualBudgets: {
                  ...campaign.actualBudgets,
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
      console.error('Error updating actual budget:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
});
