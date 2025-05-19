
import { toast } from '@/hooks/use-toast';
import { AdSet } from '@/types/campaign';
import { fetchAdSetsForCampaign } from '../../services/adSet';
import { StateCreator } from 'zustand';
import { AdSetState } from '../types';

export interface FetchAdSetsSlice {
  isLoading: boolean;
  fetchingCampaigns: Set<string>;
  fetchAdSets: (campaignId: string) => Promise<AdSet[]>;
}

export const createFetchAdSetsSlice: StateCreator<
  AdSetState, 
  [], 
  [], 
  FetchAdSetsSlice
> = (set, get) => ({
  isLoading: false,
  fetchingCampaigns: new Set<string>(),
  
  fetchAdSets: async (campaignId: string) => {
    // Prevent duplicate fetches for the same campaign
    if (get().fetchingCampaigns.has(campaignId)) {
      return get().adSets[campaignId] || [];
    }
    
    set(state => ({ 
      isLoading: true,
      fetchingCampaigns: new Set([...state.fetchingCampaigns, campaignId])
    }));
    
    try {
      const adSets = await fetchAdSetsForCampaign(campaignId);
      console.log('Ad sets fetched:', adSets.length, 'for campaign:', campaignId);
      
      set(state => ({
        adSets: {
          ...state.adSets,
          [campaignId]: adSets
        },
        isLoading: false,
        fetchingCampaigns: new Set([...state.fetchingCampaigns].filter(id => id !== campaignId))
      }));
      return adSets;
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les sous-ensembles",
        variant: "destructive"
      });
      
      set(state => ({
        isLoading: false,
        fetchingCampaigns: new Set([...state.fetchingCampaigns].filter(id => id !== campaignId))
      }));
      return [];
    }
  }
});
