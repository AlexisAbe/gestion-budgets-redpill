
import { AdSetState } from '../../types/adSetStoreTypes';
import { addAdSet, updateAdSet, deleteAdSet } from '../../services/adSet';
import { toast } from '@/hooks/use-toast';

export const createAdSetMutationActions = (set: any, get: () => AdSetState) => ({
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
      const updatedAdSet = await updateAdSet(id, updates);
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
      const success = await deleteAdSet(id, name);
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
