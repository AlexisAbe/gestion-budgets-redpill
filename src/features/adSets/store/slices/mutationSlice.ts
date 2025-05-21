
import { AdSetState } from '../types';
import { addAdSetService, updateAdSetService, deleteAdSetService } from '../../services';
import { AdSet } from '@/types/campaign';

export const createMutationAdSetsSlice = (set: any, get: () => AdSetState) => ({
  addAdSet: async (adSetData: Omit<AdSet, "id" | "createdAt" | "updatedAt">): Promise<AdSet | null> => {
    try {
      const result = await addAdSetService(adSetData);
      
      if (result) {
        // Update the store
        set((state: AdSetState) => {
          const campaignAdSets = [...(state.adSets[adSetData.campaignId] || []), result];
          
          return {
            adSets: {
              ...state.adSets,
              [adSetData.campaignId]: campaignAdSets
            }
          };
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error adding ad set in store:', error);
      return null;
    }
  },
  
  updateAdSet: async (adSetId: string, updates: Partial<AdSet>): Promise<AdSet | null> => {
    try {
      const result = await updateAdSetService(adSetId, updates);
      
      if (result) {
        // Find the campaign ID by looking through all ad sets
        let campaignId = '';
        Object.entries(get().adSets).forEach(([cId, adSets]) => {
          if (adSets.some(adSet => adSet.id === adSetId)) {
            campaignId = cId;
          }
        });
        
        if (campaignId) {
          // Update the store
          set((state: AdSetState) => {
            const existingAdSets = state.adSets[campaignId] || [];
            const updatedAdSets = existingAdSets.map(adSet => 
              adSet.id === adSetId ? { ...adSet, ...updates } : adSet
            );
            
            return {
              adSets: {
                ...state.adSets,
                [campaignId]: updatedAdSets
              }
            };
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error updating ad set in store:', error);
      return null;
    }
  },
  
  deleteAdSet: async (adSetId: string, name: string): Promise<boolean> => {
    try {
      const success = await deleteAdSetService(adSetId, name);
      
      if (success) {
        // Find the campaign ID by looking through all ad sets
        let campaignId = '';
        let removedAdSet = null;
        
        Object.entries(get().adSets).forEach(([cId, adSets]) => {
          const adSet = adSets.find(adSet => adSet.id === adSetId);
          if (adSet) {
            campaignId = cId;
            removedAdSet = adSet;
          }
        });
        
        if (campaignId) {
          // Update the store
          set((state: AdSetState) => {
            const existingAdSets = state.adSets[campaignId] || [];
            const updatedAdSets = existingAdSets.filter(adSet => adSet.id !== adSetId);
            
            return {
              adSets: {
                ...state.adSets,
                [campaignId]: updatedAdSets
              }
            };
          });
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting ad set in store:', error);
      return false;
    }
  }
});

export type MutationAdSetsSlice = ReturnType<typeof createMutationAdSetsSlice>;
