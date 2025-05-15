
import { create } from 'zustand';
import { AdSet } from '@/types/campaign';
import { 
  fetchAdSetsForCampaign, 
  addAdSet, 
  updateAdSet, 
  deleteAdSet,
  validateAdSetBudgets,
  updateAdSetActualBudget
} from './services/adSet';
import { toast } from '@/hooks/use-toast';

interface AdSetState {
  adSets: Record<string, AdSet[]>; // Keyed by campaign ID
  isLoading: boolean;
  fetchAdSets: (campaignId: string) => Promise<AdSet[]>;
  addAdSet: (adSet: Omit<AdSet, "id" | "createdAt" | "updatedAt">) => Promise<AdSet | null>;
  updateAdSet: (id: string, updates: Partial<AdSet>) => Promise<AdSet | null>;
  deleteAdSet: (id: string, name: string) => Promise<boolean>;
  validateBudgets: (campaignId: string) => Promise<{ valid: boolean, total: number }>;
  updateActualBudget: (id: string, weekLabel: string, amount: number) => Promise<boolean>;
}

export const useAdSetStore = create<AdSetState>((set, get) => ({
  adSets: {},
  isLoading: false,
  
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
  },
  
  validateBudgets: async (campaignId: string) => {
    return await validateAdSetBudgets(campaignId);
  },
  
  updateActualBudget: async (id: string, weekLabel: string, amount: number) => {
    set(state => ({ isLoading: true }));
    try {
      const success = await updateAdSetActualBudget(id, weekLabel, amount);
      if (success) {
        // Trouver la campagne associée à cet ad set
        let campaignId: string | null = null;
        let adSetName: string = '';
        
        for (const [cId, adSets] of Object.entries(get().adSets)) {
          const foundAdSet = adSets.find(adSet => adSet.id === id);
          if (foundAdSet) {
            campaignId = cId;
            adSetName = foundAdSet.name;
            
            // Mettre à jour l'ad set dans le store avec le nouveau budget réel
            set(state => ({
              adSets: {
                ...state.adSets,
                [cId]: state.adSets[cId].map(adSet => {
                  if (adSet.id === id) {
                    const updatedActualBudgets = { 
                      ...(adSet.actualBudgets || {}), 
                      [weekLabel]: amount 
                    };
                    return { ...adSet, actualBudgets: updatedActualBudgets };
                  }
                  return adSet;
                })
              },
              isLoading: false
            }));
            
            break;
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error updating ad set actual budget:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le budget réel",
        variant: "destructive"
      });
      set({ isLoading: false });
      return false;
    }
  }
}));
