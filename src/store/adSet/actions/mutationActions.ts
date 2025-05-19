
import { toast } from '@/hooks/use-toast';
import { AdSet } from '@/types/campaign';
import { addAdSet as addAdSetService, updateAdSet as updateAdSetService, deleteAdSet as deleteAdSetService } from '../../services/adSet';
import { StateCreator } from 'zustand';
import { AdSetState } from '../types';

export interface MutationAdSetsSlice {
  addAdSet: (adSet: Omit<AdSet, "id" | "createdAt" | "updatedAt">) => Promise<AdSet | null>;
  updateAdSet: (id: string, updates: Partial<AdSet>) => Promise<AdSet | null>;
  deleteAdSet: (id: string, name: string) => Promise<boolean>;
}

export const createMutationAdSetsSlice: StateCreator<
  AdSetState, 
  [], 
  [], 
  MutationAdSetsSlice
> = (set, get) => ({
  addAdSet: async (adSetData) => {
    set({ isLoading: true });
    try {
      const newAdSet = await addAdSetService(adSetData);
      if (newAdSet) {
        const campaignId = newAdSet.campaignId;
        set(state => ({
          adSets: {
            ...state.adSets,
            [campaignId]: [
              ...(state.adSets[campaignId] || []),
              newAdSet
            ]
          },
          isLoading: false
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
      set({ isLoading: false });
      return null;
    }
  },
  
  updateAdSet: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedAdSet = await updateAdSetService(id, updates);
      if (updatedAdSet) {
        const campaignId = updatedAdSet.campaignId;
        set(state => ({
          adSets: {
            ...state.adSets,
            [campaignId]: state.adSets[campaignId].map(adSet => 
              adSet.id === id ? updatedAdSet : adSet
            )
          },
          isLoading: false
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
      set({ isLoading: false });
      return null;
    }
  },
  
  deleteAdSet: async (id, name) => {
    set({ isLoading: true });
    try {
      const success = await deleteAdSetService(id, name);
      if (success) {
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
            },
            isLoading: false
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
      set({ isLoading: false });
      return false;
    }
  }
});
