
import { CampaignState } from '../types/campaignStoreTypes';
import { fetchCampaignsService } from '../services/campaign';
import { useClientStore } from '../clientStore';

export const createFetchCampaignActions = (set: any, get: () => CampaignState) => ({
  fetchCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const { selectedClientId } = useClientStore.getState();
      const result = await fetchCampaignsService();
      
      // Filter campaigns based on selected client
      const filteredCampaigns = selectedClientId 
        ? result.filter(campaign => campaign.clientId === selectedClientId)
        : result;
        
      set({ 
        campaigns: result,
        filteredCampaigns,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
    }
  }
});
