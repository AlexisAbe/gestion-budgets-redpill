
import { AdSetState } from '../types';
import { fetchAdSetsForCampaign } from '../../services';

export const createFetchAdSetsSlice = (set: any, get: () => AdSetState) => ({
  isLoading: false,
  error: null,
  
  fetchAdSets: async (campaignId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const adSets = await fetchAdSetsForCampaign(campaignId);
      
      set((state: AdSetState) => ({
        adSets: {
          ...state.adSets,
          [campaignId]: adSets,
        },
        isLoading: false
      }));
      
      return adSets;
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      
      set({
        error: error instanceof Error ? error.message : 'Unknown error fetching ad sets',
        isLoading: false
      });
      
      return [];
    }
  }
});

export type FetchAdSetsSlice = ReturnType<typeof createFetchAdSetsSlice>;
