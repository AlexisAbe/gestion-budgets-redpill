
import { Campaign } from '@/types/campaign';
import { CampaignState } from '../types/campaignStoreTypes';
import { 
  fetchCampaignsService, 
  addCampaignService, 
  updateCampaignService, 
  deleteCampaignService, 
  updateWeeklyBudgetService, 
  autoDistributeBudgetService, 
  resetStoreService 
} from '../services/campaign';
import { useClientStore } from '../clientStore';

export const createCampaignActions = (set: any, get: () => CampaignState) => ({
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
  },
  
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
  },
  
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
      await autoDistributeBudgetService(
        campaignId, 
        distributionStrategy,
        get().campaigns, 
        get().weeks, 
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
  },
  
  resetStore: () => {
    resetStoreService();
    set(initialCampaignState);
  },
});
