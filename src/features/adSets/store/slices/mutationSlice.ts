
import { AdSetState } from '../types';
import { addAdSetService, updateAdSetService, deleteAdSetService } from '../../services';

export const createMutationAdSetsSlice = (set: any, get: () => AdSetState) => ({
  addAdSet: async (adSetData: any): Promise<any> => {
    set({ isLoading: true, error: null });
    try {
      const newAdSet = await addAdSetService(adSetData);
      
      if (newAdSet) {
        set((state: AdSetState) => {
          // Get the current ad sets for this campaign
          const currentAdSets = state.adSets[newAdSet.campaignId] || [];
          
          // Add the new ad set
          return {
            adSets: {
              ...state.adSets,
              [newAdSet.campaignId]: [...currentAdSets, newAdSet]
            },
            isLoading: false
          };
        });
        
        return newAdSet;
      }
      
      set({ isLoading: false });
      return null;
    } catch (error) {
      console.error('Error adding ad set:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
      return null;
    }
  },
  
  updateAdSet: async (adSetId: string, updates: any): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const updatedAdSet = await updateAdSetService(adSetId, updates);
      
      if (updatedAdSet) {
        // Find which campaign this ad set belongs to
        let campaignId = '';
        Object.entries(get().adSets).forEach(([cId, adSets]) => {
          if (adSets.some(adSet => adSet.id === adSetId)) {
            campaignId = cId;
          }
        });
        
        if (campaignId) {
          set((state: AdSetState) => {
            const currentAdSets = state.adSets[campaignId] || [];
            
            return {
              adSets: {
                ...state.adSets,
                [campaignId]: currentAdSets.map(adSet => 
                  adSet.id === adSetId ? { ...adSet, ...updates } : adSet
                )
              },
              isLoading: false
            };
          });
        }
        
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Error updating ad set:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
      return false;
    }
  },
  
  deleteAdSet: async (adSetId: string, name: string, campaignId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const success = await deleteAdSetService(adSetId, name);
      
      if (success) {
        set((state: AdSetState) => {
          // If campaignId not provided, find which campaign this ad set belongs to
          let cId = campaignId;
          if (!cId) {
            Object.entries(state.adSets).forEach(([id, adSets]) => {
              if (adSets.some(adSet => adSet.id === adSetId)) {
                cId = id;
              }
            });
          }
          
          if (cId && state.adSets[cId]) {
            return {
              adSets: {
                ...state.adSets,
                [cId]: state.adSets[cId].filter(adSet => adSet.id !== adSetId)
              },
              isLoading: false
            };
          }
          
          return { isLoading: false };
        });
        
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Error deleting ad set:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
      return false;
    }
  }
});

export type MutationAdSetsSlice = ReturnType<typeof createMutationAdSetsSlice>;
