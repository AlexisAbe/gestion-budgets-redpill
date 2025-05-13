
import { create } from 'zustand';
import { AdSet } from '@/types/campaign';
import { 
  fetchAdSetsForCampaign, 
  addAdSet, 
  updateAdSet, 
  deleteAdSet,
  validateAdSetBudgets
} from './services/adSet/adSetService';
import { toast } from '@/hooks/use-toast';

interface AdSetState {
  adSets: Record<string, AdSet[]>; // Keyed by campaign ID
  isLoading: boolean;
  fetchAdSets: (campaignId: string) => Promise<AdSet[]>;
  addAdSet: (adSet: Omit<AdSet, "id" | "createdAt" | "updatedAt">) => Promise<AdSet | null>;
  updateAdSet: (id: string, updates: Partial<AdSet>) => Promise<AdSet | null>;
  deleteAdSet: (id: string, name: string) => Promise<boolean>;
  validateBudgets: (campaignId: string) => Promise<{ valid: boolean, total: number }>;
}

export const useAdSetStore = create<AdSetState>((set, get) => ({
  adSets: {},
  isLoading: false,
  
  fetchAdSets: async (campaignId: string) => {
    set(state => ({ isLoading: true }));
    try {
      const adSets = await fetchAdSetsForCampaign(campaignId);
      console.log('Ad sets fetched:', adSets.length);
      
      set(state => ({
        adSets: {
          ...state.adSets,
          [campaignId]: adSets
        }
      }));
      return adSets;
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les sous-ensembles",
        variant: "destructive"
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  addAdSet: async (adSetData) => {
    set({ isLoading: true });
    try {
      const newAdSet = await addAdSet(adSetData);
      if (newAdSet) {
        const campaignId = newAdSet.campaignId;
        set(state => ({
          adSets: {
            ...state.adSets,
            [campaignId]: [
              ...(state.adSets[campaignId] || []),
              newAdSet
            ]
          }
        }));
        toast({
          title: "Succès",
          description: `Sous-ensemble "${newAdSet.name}" ajouté`,
        });
      }
      return newAdSet;
    } catch (error) {
      console.error('Error adding ad set:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le sous-ensemble",
        variant: "destructive"
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateAdSet: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedAdSet = await updateAdSet(id, updates);
      if (updatedAdSet) {
        const campaignId = updatedAdSet.campaignId;
        set(state => ({
          adSets: {
            ...state.adSets,
            [campaignId]: state.adSets[campaignId].map(adSet => 
              adSet.id === id ? updatedAdSet : adSet
            )
          }
        }));
        toast({
          title: "Succès",
          description: `Sous-ensemble "${updatedAdSet.name}" mis à jour`,
        });
      }
      return updatedAdSet;
    } catch (error) {
      console.error('Error updating ad set:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le sous-ensemble",
        variant: "destructive"
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteAdSet: async (id, name) => {
    set({ isLoading: true });
    try {
      const success = await deleteAdSet(id, name);
      if (success) {
        // Find which campaign this ad set belongs to
        let campaignId: string | null = null;
        for (const [cId, adSets] of Object.entries(get().adSets)) {
          if (adSets.some(adSet => adSet.id === id)) {
            campaignId = cId;
            break;
          }
        }
        
        if (campaignId) {
          set(state => ({
            adSets: {
              ...state.adSets,
              [campaignId!]: state.adSets[campaignId!].filter(adSet => adSet.id !== id)
            }
          }));
          toast({
            title: "Succès",
            description: `Sous-ensemble "${name}" supprimé`,
          });
        }
      }
      return success;
    } catch (error) {
      console.error('Error deleting ad set:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le sous-ensemble",
        variant: "destructive"
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  validateBudgets: async (campaignId: string) => {
    return await validateAdSetBudgets(campaignId);
  }
}));
