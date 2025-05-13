
import { create } from 'zustand';
import { Campaign, MediaChannel, MarketingObjective } from '../types/campaign';
import { generateWeeksForYear, WeeklyView } from '../utils/dateUtils';
import { isBudgetBalanced, distributeEvenlyAcrossWeeks } from '../utils/budgetUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mapToCampaign, mapToSupabaseCampaign } from '@/utils/supabaseUtils';
import { useAuth } from '@/context/AuthContext';

const YEAR = 2025;

interface CampaignState {
  campaigns: Campaign[];
  weeks: WeeklyView[];
  isLoading: boolean;
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  updateWeeklyBudget: (campaignId: string, weekLabel: string, amount: number) => Promise<void>;
  autoDistributeBudget: (campaignId: string, method: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve') => Promise<void>;
  resetStore: () => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  weeks: generateWeeksForYear(YEAR),
  isLoading: false,
  
  fetchCampaigns: async () => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database response to our frontend Campaign type
      const campaigns = (data || []).map(item => mapToCampaign(item));
      set({ campaigns });
      console.log('Campaigns fetched from Supabase:', campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Erreur lors de la récupération des campagnes');
    } finally {
      set({ isLoading: false });
    }
  },
  
  addCampaign: async (campaignData) => {
    set({ isLoading: true });
    
    try {
      // Auto-distribute budget evenly if no weekly budgets provided
      if (Object.keys(campaignData.weeklyBudgets).length === 0) {
        campaignData.weeklyBudgets = distributeEvenlyAcrossWeeks(
          { ...campaignData, id: '', createdAt: '', updatedAt: '' } as Campaign,
          get().weeks
        );
      }
      
      // Get the current user from localStorage
      const storedUser = localStorage.getItem('selectedUser');
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      
      // Convert to snake_case for Supabase
      const supabaseCampaignData = mapToSupabaseCampaign(campaignData);
      
      // Add the created_by field with the current user's ID
      const dataWithUser = {
        ...supabaseCampaignData,
        created_by: userId
      };
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert(dataWithUser)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert from snake_case to our frontend type
      const newCampaign = mapToCampaign(data);
      
      set(state => ({ campaigns: [newCampaign, ...state.campaigns] }));
      
      console.log(`Campaign "${newCampaign.name}" added`, newCampaign);
      
      // Check if budget is balanced
      const balanced = isBudgetBalanced(newCampaign);
      
      if (!balanced) {
        toast.warning(`La campagne "${newCampaign.name}" a un budget non alloué. Veuillez vérifier les allocations hebdomadaires.`);
      } else {
        toast.success(`Campagne "${newCampaign.name}" ajoutée avec succès`);
      }
      
      return newCampaign.id;
    } catch (error) {
      console.error('Error adding campaign:', error);
      toast.error('Erreur lors de l\'ajout de la campagne');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateCampaign: async (id, data) => {
    try {
      // Convert to snake_case for Supabase
      const updateData: Record<string, any> = {};
      
      if ('mediaChannel' in data) updateData.media_channel = data.mediaChannel;
      if ('name' in data) updateData.name = data.name;
      if ('objective' in data) updateData.objective = data.objective;
      if ('targetAudience' in data) updateData.target_audience = data.targetAudience;
      if ('startDate' in data) updateData.start_date = data.startDate;
      if ('totalBudget' in data) updateData.total_budget = data.totalBudget;
      if ('durationDays' in data) updateData.duration_days = data.durationDays;
      if ('weeklyBudgets' in data) updateData.weekly_budgets = data.weeklyBudgets;
      
      const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => {
        const campaignIndex = state.campaigns.findIndex(c => c.id === id);
        
        if (campaignIndex === -1) {
          console.error(`Campaign with ID ${id} not found`);
          return state;
        }
        
        const updatedCampaign = {
          ...state.campaigns[campaignIndex],
          ...data,
        };
        
        const newCampaigns = [...state.campaigns];
        newCampaigns[campaignIndex] = updatedCampaign;
        
        console.log(`Campaign "${updatedCampaign.name}" updated:`, data);
        
        // Check if budget is balanced after update
        if ('totalBudget' in data || 'weeklyBudgets' in data) {
          const balanced = isBudgetBalanced(updatedCampaign);
          
          if (!balanced) {
            toast.warning(`La campagne "${updatedCampaign.name}" a un budget non alloué. Veuillez vérifier les allocations hebdomadaires.`);
          }
        }
        
        return { campaigns: newCampaigns };
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Erreur lors de la mise à jour de la campagne');
    }
  },
  
  deleteCampaign: async (id) => {
    try {
      const campaignToDelete = get().campaigns.find(c => c.id === id);
      if (!campaignToDelete) return;
      
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({ campaigns: state.campaigns.filter(c => c.id !== id) }));
      
      console.log(`Campaign "${campaignToDelete.name}" deleted`);
      toast.info(`Campagne "${campaignToDelete.name}" supprimée`);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erreur lors de la suppression de la campagne');
    }
  },
  
  updateWeeklyBudget: async (campaignId, weekLabel, amount) => {
    try {
      const campaignIndex = get().campaigns.findIndex(c => c.id === campaignId);
      
      if (campaignIndex === -1) {
        console.error(`Campaign with ID ${campaignId} not found`);
        return;
      }
      
      const campaign = get().campaigns[campaignIndex];
      const newWeeklyBudgets = { ...campaign.weeklyBudgets };
      
      // Update the budget for the specified week
      newWeeklyBudgets[weekLabel] = amount;
      
      // Update in Supabase
      const { error } = await supabase
        .from('campaigns')
        .update({ weekly_budgets: newWeeklyBudgets })
        .eq('id', campaignId);
      
      if (error) throw error;
      
      // Update state
      set(state => {
        const updatedCampaign = {
          ...campaign,
          weeklyBudgets: newWeeklyBudgets,
        };
        
        const newCampaigns = [...state.campaigns];
        newCampaigns[campaignIndex] = updatedCampaign;
        
        console.log(`Weekly budget updated for campaign "${campaign.name}"`, {
          week: weekLabel,
          amount,
          balanced: isBudgetBalanced(updatedCampaign)
        });
        
        return { campaigns: newCampaigns };
      });
    } catch (error) {
      console.error('Error updating weekly budget:', error);
      toast.error('Erreur lors de la mise à jour du budget hebdomadaire');
    }
  },
  
  autoDistributeBudget: async (campaignId, method) => {
    const { campaigns, weeks } = get();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return;
    }
    
    let newWeeklyBudgets: Record<string, number> = {};
    
    // Distribute based on selected method
    if (method === 'even') {
      newWeeklyBudgets = distributeEvenlyAcrossWeeks(campaign, weeks);
    } else {
      const { distributeByCurve } = require('../utils/budgetUtils');
      newWeeklyBudgets = distributeByCurve(campaign, weeks, method);
    }
    
    // Update in Supabase
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ weekly_budgets: newWeeklyBudgets })
        .eq('id', campaignId);
      
      if (error) throw error;
      
      // Update the campaign
      set(state => {
        const campaignIndex = state.campaigns.findIndex(c => c.id === campaignId);
        const updatedCampaign = {
          ...campaign,
          weeklyBudgets: newWeeklyBudgets,
        };
        
        const newCampaigns = [...state.campaigns];
        newCampaigns[campaignIndex] = updatedCampaign;
        
        console.log(`Budget auto-distributed for campaign "${campaign.name}" using ${method} method`);
        toast.success(`Le budget pour "${campaign.name}" a été automatiquement distribué`);
        
        return { campaigns: newCampaigns };
      });
    } catch (error) {
      console.error('Error auto-distributing budget:', error);
      toast.error('Erreur lors de la distribution automatique du budget');
    }
  },
  
  resetStore: async () => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all campaigns
      
      if (error) throw error;
      
      set({
        campaigns: [],
        weeks: generateWeeksForYear(YEAR)
      });
      
      console.log("Store reset to initial state");
      toast.info("Toutes les données des campagnes ont été réinitialisées");
    } catch (error) {
      console.error('Error resetting store:', error);
      toast.error('Erreur lors de la réinitialisation des données');
    }
  }
}));

// Function to add example campaigns (now with Supabase persistence)
export async function addExampleCampaigns() {
  const store = useCampaignStore.getState();
  
  try {
    // Facebook Awareness Campaign
    await store.addCampaign({
      mediaChannel: "META" as MediaChannel,
      name: "Summer Resorts Awareness",
      objective: "awareness" as MarketingObjective,
      targetAudience: "Families with children 5-12",
      startDate: "2025-04-01", // April 1st
      totalBudget: 25000,
      durationDays: 60, // 2 months
      weeklyBudgets: {}
    });
    
    // Google Search Campaign
    await store.addCampaign({
      mediaChannel: "GOOGLE" as MediaChannel,
      name: "Winter Ski Resorts",
      objective: "conversion" as MarketingObjective,
      targetAudience: "Adults 25-45, skiing enthusiasts",
      startDate: "2025-10-15", // October 15th
      totalBudget: 15000,
      durationDays: 90, // 3 months
      weeklyBudgets: {}
    });
    
    // LinkedIn Campaign
    await store.addCampaign({
      mediaChannel: "LINKEDIN" as MediaChannel,
      name: "Corporate Retreats",
      objective: "consideration" as MarketingObjective,
      targetAudience: "HR Managers, Event Planners",
      startDate: "2025-02-01", // February 1st
      totalBudget: 12000,
      durationDays: 45, // 1.5 months
      weeklyBudgets: {}
    });
    
    // Email Campaign
    await store.addCampaign({
      mediaChannel: "EMAIL" as MediaChannel,
      name: "Loyalty Members Exclusive",
      objective: "loyalty" as MarketingObjective,
      targetAudience: "Existing Belambra Club members",
      startDate: "2025-06-01", // June 1st
      totalBudget: 5000,
      durationDays: 30, // 1 month
      weeklyBudgets: {}
    });
    
    console.log("Example campaigns added to Supabase");
  } catch (error) {
    console.error("Error adding example campaigns:", error);
    toast.error("Erreur lors de l'ajout des campagnes d'exemple");
  }
}
