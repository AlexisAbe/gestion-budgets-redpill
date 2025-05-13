
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
  autoDistributeBudget: (campaignId: string, distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual', percentages?: Record<string, number>) => Promise<void>;
  resetStore: () => void;
}

const initialState = {
  campaigns: [],
  filteredCampaigns: [],
  weeks: [],
  isLoading: false,
  error: null,
};

export const useCampaignStore = create<CampaignState>((set, get) => {
  return {
    ...initialState,
    
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
        await updateCampaignService({
          ...updates,
          id: campaignId,
        } as Campaign);
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
        // Fix error: Expected 2 arguments, but got 1
        // Now passing both campaignId and the needed data
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
    
    autoDistributeBudget: async (campaignId, distributionStrategy, percentages) => {
      try {
        // Fix error: Argument of type 'string' is not assignable to parameter of type '"even" | "front-loaded" | "back-loaded" | "bell-curve" | "manual"'
        // We need to cast distributionStrategy to the expected type since we've properly typed the function parameters
        await autoDistributeBudgetService(
          campaignId, 
          distributionStrategy as 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual',
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
      set(initialState);
    },
  };
});

// Fix error: Expected 1 arguments, but got 2
// The subscribe method should take a single callback function
useClientStore.subscribe(
  (state) => {
    const { selectedClientId } = state;
    const campaignStore = useCampaignStore.getState();
    const filteredCampaigns = selectedClientId 
      ? campaignStore.campaigns.filter(campaign => campaign.clientId === selectedClientId)
      : campaignStore.campaigns;
      
    useCampaignStore.setState({ filteredCampaigns });
  }
);
