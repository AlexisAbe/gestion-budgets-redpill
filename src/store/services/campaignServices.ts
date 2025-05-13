
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { mapToCampaign, mapToSupabaseCampaign } from '@/utils/supabaseUtils';
import { isBudgetBalanced, distributeEvenlyAcrossWeeks } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Fetch all campaigns from the database
export async function fetchCampaignsService(): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    
    // Map database response to our frontend Campaign type
    const campaigns = (data || []).map(item => mapToCampaign(item));
    console.log('Campaigns fetched from Supabase:', campaigns);
    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    toast.error('Erreur lors de la récupération des campagnes');
    return [];
  }
}

// Add a new campaign to the database
export async function addCampaignService(
  campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>, 
  weeks: WeeklyView[]
): Promise<string> {
  try {
    // Auto-distribute budget evenly if no weekly budgets provided
    if (Object.keys(campaignData.weeklyBudgets).length === 0) {
      campaignData.weeklyBudgets = distributeEvenlyAcrossWeeks(
        { ...campaignData, id: '', createdAt: '', updatedAt: '' } as Campaign,
        weeks
      );
    }
    
    // Generate a UUID for the campaign
    const campaignId = uuidv4();
    
    // Convert to snake_case for Supabase
    const supabaseCampaignData = mapToSupabaseCampaign(campaignData);
    
    // Add the id to the data
    const dataWithId = {
      ...supabaseCampaignData,
      id: campaignId
    };
    
    console.log('Attempting to insert campaign with data:', dataWithId);
    
    const { data, error } = await supabase
      .from('campaigns')
      .insert(dataWithId)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    // Convert from snake_case to our frontend type
    const newCampaign = mapToCampaign(data);
    
    console.log(`Campaign "${newCampaign.name}" added successfully`, newCampaign);
    
    // Check if budget is balanced
    const balanced = isBudgetBalanced(newCampaign);
    
    if (!balanced) {
      toast.warning(`La campagne "${newCampaign.name}" a un budget non alloué. Veuillez vérifier les allocations hebdomadaires.`);
    } else {
      toast.success(`Campagne "${newCampaign.name}" ajoutée avec succès`);
    }
    
    return campaignId;
  } catch (error) {
    console.error('Error adding campaign:', error);
    toast.error('Erreur lors de l\'ajout de la campagne');
    throw error;
  }
}

// Update an existing campaign
export async function updateCampaignService(
  id: string, 
  data: Partial<Campaign>,
  campaigns: Campaign[]
): Promise<void> {
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
    
    console.log('Attempting to update campaign with ID:', id, 'and data:', updateData);
    
    const { error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    const campaignIndex = campaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      console.error(`Campaign with ID ${id} not found`);
      return;
    }
    
    const updatedCampaign = {
      ...campaigns[campaignIndex],
      ...data,
    };
    
    console.log(`Campaign "${updatedCampaign.name}" updated:`, data);
    
    // Check if budget is balanced after update
    if ('totalBudget' in data || 'weeklyBudgets' in data) {
      const balanced = isBudgetBalanced(updatedCampaign);
      
      if (!balanced) {
        toast.warning(`La campagne "${updatedCampaign.name}" a un budget non alloué. Veuillez vérifier les allocations hebdomadaires.`);
      }
    }
  } catch (error) {
    console.error('Error updating campaign:', error);
    toast.error('Erreur lors de la mise à jour de la campagne');
    throw error;
  }
}

// Delete a campaign
export async function deleteCampaignService(id: string, campaignName: string): Promise<void> {
  try {
    console.log('Attempting to delete campaign with ID:', id);
    
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    
    console.log(`Campaign "${campaignName}" deleted`);
    toast.info(`Campagne "${campaignName}" supprimée`);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    toast.error('Erreur lors de la suppression de la campagne');
    throw error;
  }
}

// Update the weekly budget for a campaign
export async function updateWeeklyBudgetService(
  campaignId: string, 
  weekLabel: string, 
  amount: number,
  campaigns: Campaign[]
): Promise<void> {
  try {
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return;
    }
    
    const campaign = campaigns[campaignIndex];
    const newWeeklyBudgets = { ...campaign.weeklyBudgets };
    
    // Update the budget for the specified week
    newWeeklyBudgets[weekLabel] = amount;
    
    console.log('Updating weekly budget for campaign ID:', campaignId, 'week:', weekLabel, 'amount:', amount);
    
    // Update in Supabase
    const { error } = await supabase
      .from('campaigns')
      .update({ weekly_budgets: newWeeklyBudgets })
      .eq('id', campaignId);
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    const updatedCampaign = {
      ...campaign,
      weeklyBudgets: newWeeklyBudgets,
    };
    
    console.log(`Weekly budget updated for campaign "${campaign.name}"`, {
      week: weekLabel,
      amount,
      balanced: isBudgetBalanced(updatedCampaign)
    });
  } catch (error) {
    console.error('Error updating weekly budget:', error);
    toast.error('Erreur lors de la mise à jour du budget hebdomadaire');
    throw error;
  }
}

// Auto-distribute the budget for a campaign
export async function autoDistributeBudgetService(
  campaignId: string, 
  method: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve',
  campaigns: Campaign[],
  weeks: WeeklyView[]
): Promise<void> {
  try {
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
      const { distributeByCurve } = require('@/utils/budgetUtils');
      newWeeklyBudgets = distributeByCurve(campaign, weeks, method);
    }
    
    console.log('Auto-distributing budget for campaign ID:', campaignId, 'using method:', method);
    
    // Update in Supabase
    const { error } = await supabase
      .from('campaigns')
      .update({ weekly_budgets: newWeeklyBudgets })
      .eq('id', campaignId);
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    console.log(`Budget auto-distributed for campaign "${campaign.name}" using ${method} method`);
    toast.success(`Le budget pour "${campaign.name}" a été automatiquement distribué`);
  } catch (error) {
    console.error('Error auto-distributing budget:', error);
    toast.error('Erreur lors de la distribution automatique du budget');
    throw error;
  }
}

// Reset the store
export async function resetStoreService(): Promise<void> {
  try {
    console.log('Attempting to reset store by deleting all campaigns');
    
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all campaigns
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    
    console.log("Store reset to initial state");
    toast.info("Toutes les données des campagnes ont été réinitialisées");
  } catch (error) {
    console.error('Error resetting store:', error);
    toast.error('Erreur lors de la réinitialisation des données');
    throw error;
  }
}
