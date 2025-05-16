
import { AdSetState } from '../../types/adSetStoreTypes';
import { fetchAdSetsForCampaign } from '../../services/adSet';
import { toast } from '@/hooks/use-toast';

export const createFetchAdSetActions = (set: any, get: () => AdSetState) => ({
  fetchAdSets: async (campaignId: string) => {
    set({ isLoading: true });
    try {
      const adSets = await fetchAdSetsForCampaign(campaignId);
      console.log('Ad sets fetched:', adSets.length);
      
      set(state => ({
        adSets: {
          ...state.adSets,
          [campaignId]: adSets
        },
        isLoading: false
      }));
      return adSets;
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les sous-ensembles",
        variant: "destructive"
      });
      set({ isLoading: false });
      return [];
    }
  }
});
