
import { create } from 'zustand';
import { AdSet } from '@/types/campaign';
import { fetchAdSetsService, addAdSetService, updateAdSetService, deleteAdSetService, updateAdSetWeeklyNoteService } from './services/adSet/adSetService';
import { toast } from 'sonner';

interface AdSetState {
  adSets: Record<string, AdSet[]>; // Map campaign ID to array of ad sets
  isLoading: boolean;
  error: string | null;
  fetchAdSets: (campaignId: string) => Promise<void>;
  addAdSet: (adSet: Omit<AdSet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAdSet: (adSetId: string, updates: Partial<AdSet>) => Promise<void>;
  deleteAdSet: (adSetId: string) => Promise<void>;
  updateAdSetWeeklyNote: (adSetId: string, weekLabel: string, note: string) => Promise<void>;
}

export const useAdSetStore = create<AdSetState>((set, get) => ({
  adSets: {},
  isLoading: false,
  error: null,
  
  fetchAdSets: async (campaignId: string) => {
    set({ isLoading: true });
    try {
      const fetchedAdSets = await fetchAdSetsService(campaignId);
      set((state) => ({
        adSets: {
          ...state.adSets,
          [campaignId]: fetchedAdSets
        },
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  addAdSet: async (adSet) => {
    set({ isLoading: true });
    try {
      const newAdSet = await addAdSetService(adSet);
      set((state) => {
        const campaignId = adSet.campaignId;
        const currentAdSets = state.adSets[campaignId] || [];
        return {
          adSets: {
            ...state.adSets,
            [campaignId]: [...currentAdSets, newAdSet]
          },
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Error adding ad set:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  updateAdSet: async (adSetId, updates) => {
    set({ isLoading: true });
    try {
      const updatedAdSet = await updateAdSetService(adSetId, updates);
      set((state) => {
        const campaignId = updatedAdSet.campaignId;
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
    } catch (error) {
      console.error('Error updating ad set:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  deleteAdSet: async (adSetId) => {
    set({ isLoading: true });
    try {
      // First, identify which campaign this ad set belongs to
      let campaignId: string | null = null;
      
      // Look through all campaigns to find the ad set
      Object.entries(get().adSets).forEach(([cId, adSets]) => {
        if (adSets.some(adSet => adSet.id === adSetId)) {
          campaignId = cId;
        }
      });
      
      if (!campaignId) throw new Error('Ad set not found');
      
      await deleteAdSetService(adSetId);
      
      set((state) => {
        if (!campaignId) return state; // Should never happen due to error check above
        
        const currentAdSets = state.adSets[campaignId] || [];
        return {
          adSets: {
            ...state.adSets,
            [campaignId]: currentAdSets.filter(adSet => adSet.id !== adSetId)
          },
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Error deleting ad set:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  updateAdSetWeeklyNote: async (adSetId, weekLabel, note) => {
    try {
      await updateAdSetWeeklyNoteService(adSetId, weekLabel, note);
      
      set((state) => {
        // Find which campaign this ad set belongs to
        let campaignId: string | null = null;
        let adSetIndex = -1;
        
        Object.entries(state.adSets).forEach(([cId, adSets]) => {
          const index = adSets.findIndex(adSet => adSet.id === adSetId);
          if (index !== -1) {
            campaignId = cId;
            adSetIndex = index;
          }
        });
        
        if (!campaignId || adSetIndex === -1) return state; // Ad set not found
        
        const currentAdSets = [...state.adSets[campaignId]];
        const adSet = currentAdSets[adSetIndex];
        
        // Update the weekly note
        currentAdSets[adSetIndex] = {
          ...adSet,
          weeklyNotes: {
            ...(adSet.weeklyNotes || {}),
            [weekLabel]: note
          }
        };
        
        return {
          adSets: {
            ...state.adSets,
            [campaignId]: currentAdSets
          }
        };
      });
      
      toast.success('Note enregistrée avec succès');
    } catch (error) {
      console.error('Error updating ad set note:', error);
      toast.error(`Erreur lors de la mise à jour de la note: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}));
