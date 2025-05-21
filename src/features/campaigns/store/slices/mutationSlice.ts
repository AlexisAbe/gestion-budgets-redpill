
import { CampaignState } from '../types';
import { 
  addCampaignService, 
  updateCampaignService, 
  deleteCampaignService 
} from '../../services';
import { Campaign } from '@/types/campaign';

export const createMutationSlice = (set: any, get: () => CampaignState) => ({
  addCampaign: async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign | null> => {
    set({ isLoading: true, error: null });
    
    try {
      const newCampaign = await addCampaignService(campaign);
      
      if (newCampaign) {
        set((state: CampaignState) => {
          const campaigns = [...state.campaigns, newCampaign];
          
          // Filter campaigns based on client if there is filtering in place
          const filteredCampaigns = state.filteredCampaigns.length > 0 
            ? (newCampaign.clientId === campaigns[0].clientId 
              ? [...state.filteredCampaigns, newCampaign] 
              : state.filteredCampaigns)
            : campaigns;
            
          return { 
            campaigns,
            filteredCampaigns,
            isLoading: false 
          };
        });
      } else {
        set({ isLoading: false });
      }
      
      return newCampaign;
    } catch (error) {
      console.error('Error adding campaign:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
      return null;
    }
  },
  
  updateCampaign: async (campaignId: string, updates: Partial<Campaign>): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const success = await updateCampaignService(campaignId, updates);
      
      if (success) {
        set((state: CampaignState) => {
          const updatedCampaigns = state.campaigns.map(campaign =>
            campaign.id === campaignId ? { ...campaign, ...updates } : campaign
          );
          
          const updatedFilteredCampaigns = state.filteredCampaigns.map(campaign =>
            campaign.id === campaignId ? { ...campaign, ...updates } : campaign
          );
          
          return {
            campaigns: updatedCampaigns,
            filteredCampaigns: updatedFilteredCampaigns,
            isLoading: false
          };
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
    }
  },
  
  deleteCampaign: async (campaignId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const success = await deleteCampaignService(campaignId);
      
      if (success) {
        set((state: CampaignState) => ({
          campaigns: state.campaigns.filter(campaign => campaign.id !== campaignId),
          filteredCampaigns: state.filteredCampaigns.filter(campaign => campaign.id !== campaignId),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
    }
  }
});
