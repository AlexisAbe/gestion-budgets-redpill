import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign, WeeklyView } from '@/types/campaign';
import { fetchCampaignsService, addCampaignService, updateCampaignService, deleteCampaignService, updateWeeklyBudgetService, autoDistributeBudgetService, resetStoreService } from './services/campaign';
import { useClientStore } from './clientStore';

interface CampaignState {
  campaigns: Campaign[];
  filteredCampaigns: Campaign[];
  weeks: WeeklyView[];
  isLoading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Campaign | null>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  updateWeeklyBudget: (campaignId: string, weekLabel: string, amount: number) => Promise<void>;
  updateActualBudget: (campaignId: string, weekLabel: string, amount: number) => Promise<void>;
  autoDistributeBudget: (campaignId: string, distributionStrategy: string) => Promise<void>;
  resetStore: () => void;
}

const initialState = {
  campaigns: [],
  filteredCampaigns: [],
  weeks: [],
  isLoading: false,
  error: null,
};

export const useCampaignStore = create<CampaignState>()((set, get) => {
  return {
    ...initialState,
    
    fetchCampaigns: async () => {
      set({ isLoading: true, error: null });
      try {
        const { selectedClientId } = useClientStore.getState();
        const result = await fetchCampaignsService();
        
        // Filter campaigns based on selected client
        const filteredCampaigns = selectedClientId 
          ? result.campaigns.filter(campaign => campaign.clientId === selectedClientId)
          : result.campaigns;
          
        set({ 
          campaigns: result.campaigns,
          filteredCampaigns,
          weeks: result.weeks,
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
    
    addCampaign: async (campaignData) => {
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
        const newCampaign = await addCampaignService(campaignWithClient);
        if (newCampaign) {
          set(state => ({
            campaigns: [...state.campaigns, newCampaign],
            filteredCampaigns: [...state.filteredCampaigns, newCampaign]
          }));
          return newCampaign;
        }
        return null;
      } catch (error) {
        console.error('Error adding campaign:', error);
        set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        return null;
      }
    },
    
    updateCampaign: async (campaignId, updates) => {
      try {
        await updateCampaignService(campaignId, updates);
        set(state => ({
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
    
    deleteCampaign: async (campaignId) => {
      try {
        await deleteCampaignService(campaignId);
        set(state => ({
          campaigns: state.campaigns.filter(campaign => campaign.id !== campaignId),
          filteredCampaigns: state.filteredCampaigns.filter(campaign => campaign.id !== campaignId),
        }));
      } catch (error) {
        console.error('Error deleting campaign:', error);
        set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
      }
    },
    
    updateWeeklyBudget: async (campaignId, weekLabel, amount) => {
      try {
        await updateWeeklyBudgetService(campaignId, weekLabel, amount);
        set(state => ({
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
      set(state => ({
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
    
    autoDistributeBudget: async (campaignId, distributionStrategy) => {
      try {
        await autoDistributeBudgetService(campaignId, distributionStrategy);
        const { campaigns } = await fetchCampaignsService();
        set({ 
          campaigns: campaigns,
          filteredCampaigns: campaigns
        });
      } catch (error) {
        console.error('Error auto distributing budget:', error);
        set({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
      }
    },
    
    resetStore: () => {
      resetStoreService();
      set(initialState);
    },
  };
});

// Add a listener to update filteredCampaigns when client changes
useClientStore.subscribe(
  (state) => state.selectedClientId,
  (selectedClientId) => {
    const campaignStore = useCampaignStore.getState();
    const filteredCampaigns = selectedClientId 
      ? campaignStore.campaigns.filter(campaign => campaign.clientId === selectedClientId)
      : campaignStore.campaigns;
      
    useCampaignStore.setState({ filteredCampaigns });
  }
);
