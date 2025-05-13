
import { CampaignState } from '../types/campaignStoreTypes';
import { updateWeeklyBudgetService, autoDistributeBudgetService, fetchCampaignsService } from '../services/campaign';
import { useClientStore } from '../clientStore';

export const createBudgetActions = (set: any, get: () => CampaignState) => ({
  updateWeeklyBudget: async (campaignId: string, weekLabel: string, amount: number) => {
    try {
      await updateWeeklyBudgetService(campaignId, weekLabel, amount);
      
      set((state: CampaignState) => ({
        campaigns: state.campaigns.map(campaign => {
          if (campaign.id === campaignId) {
            return {
              ...campaign,
              weeklyBudgets: {
                ...campaign.weeklyBudgets,
                [weekLabel]: amount,
              },
            };
          }
          return campaign;
        }),
        filteredCampaigns: state.filteredCampaigns.map(campaign => {
          if (campaign.id === campaignId) {
            return {
              ...campaign,
              weeklyBudgets: {
                ...campaign.weeklyBudgets,
                [weekLabel]: amount,
              },
            };
          }
          return campaign;
        }),
      }));
    } catch (error) {
      console.error('Error updating weekly budget:', error);
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  },
  
  updateActualBudget: async (campaignId: string, weekLabel: string, amount: number) => {
    set((state: CampaignState) => ({
      campaigns: state.campaigns.map(campaign => {
        if (campaign.id === campaignId) {
          const updatedActualBudgets = { ...campaign.actualBudgets, [weekLabel]: amount };
          return { ...campaign, actualBudgets: updatedActualBudgets };
        }
        return campaign;
      }),
      filteredCampaigns: state.filteredCampaigns.map(campaign => {
        if (campaign.id === campaignId) {
          const updatedActualBudgets = { ...campaign.actualBudgets, [weekLabel]: amount };
          return { ...campaign, actualBudgets: updatedActualBudgets };
        }
        return campaign;
      }),
    }));
  },
  
  autoDistributeBudget: async (
    campaignId: string, 
    distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual',
    percentages?: Record<string, number>
  ) => {
    try {
      // Get the weeks from the store to pass to the service
      const currentWeeks = get().weeks;
      
      await autoDistributeBudgetService(
        campaignId, 
        distributionStrategy,
        get().campaigns, 
        currentWeeks, 
        percentages
      );
      
      const updatedCampaigns = await fetchCampaignsService();
      
      // Filter campaigns based on selected client
      const { selectedClientId } = useClientStore.getState();
      const filteredCampaigns = selectedClientId 
        ? updatedCampaigns.filter(campaign => campaign.clientId === selectedClientId)
        : updatedCampaigns;
      
      set({ 
        campaigns: updatedCampaigns,
        filteredCampaigns
      });
    } catch (error) {
      console.error('Error auto distributing budget:', error);
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  }
});
