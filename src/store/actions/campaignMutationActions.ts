
import { Campaign } from '@/types/campaign';
import { CampaignState } from '../types/campaignStoreTypes';
import { addCampaignService, updateCampaignService, deleteCampaignService } from '../services/campaign';
import { useClientStore } from '../clientStore';

export const createCampaignMutationActions = (set: any, get: () => CampaignState) => ({
  addCampaign: async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { selectedClientId } = useClientStore.getState();
    if (!selectedClientId) {
      set({ error: 'No client selected' });
      return null;
    }
    
    // Add client ID to the campaign data
    const campaignWithClient = {
      ...campaignData,
      clientId: selectedClientId
    };
    
    try {
      const newCampaignId = await addCampaignService(campaignWithClient);
      
      if (newCampaignId) {
        // Fetch the full campaign data to return a proper Campaign object
        const { campaigns } = get();
        const newCampaign = campaigns.find(c => c.id === newCampaignId);
        
        if (newCampaign) {
          set((state: CampaignState) => ({
            campaigns: [...state.campaigns, newCampaign],
            filteredCampaigns: [...state.filteredCampaigns, newCampaign]
          }));
          return newCampaign;
        }
        
        // If not found in state yet, refresh campaigns
        await get().fetchCampaigns();
        return get().campaigns.find(c => c.id === newCampaignId) || null;
      }
      return null;
    } catch (error) {
      console.error('Error adding campaign:', error);
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
      return null;
    }
  },
  
  updateCampaign: async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      await updateCampaignService({
        ...updates,
        id: campaignId,
      } as Campaign);
      set((state: CampaignState) => ({
        campaigns: state.campaigns.map(campaign =>
          campaign.id === campaignId ? { ...campaign, ...updates } : campaign
        ),
        filteredCampaigns: state.filteredCampaigns.map(campaign =>
          campaign.id === campaignId ? { ...campaign, ...updates } : campaign
        ),
      }));
    } catch (error) {
      console.error('Error updating campaign:', error);
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  },
  
  deleteCampaign: async (campaignId: string) => {
    try {
      // Find the campaign to get its name
      const campaign = get().campaigns.find(c => c.id === campaignId);
      if (!campaign) throw new Error('Campaign not found');
      
      await deleteCampaignService(campaignId, campaign.name);
      set((state: CampaignState) => ({
        campaigns: state.campaigns.filter(campaign => campaign.id !== campaignId),
        filteredCampaigns: state.filteredCampaigns.filter(campaign => campaign.id !== campaignId),
      }));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  }
});
