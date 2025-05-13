
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToSupabaseCampaign, mapToCampaign } from '@/utils/supabaseUtils';
import { isBudgetBalanced } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';

export async function updateCampaignService(campaign: Campaign): Promise<Campaign> {
  try {
    // Convert to snake_case for Supabase
    const { id, ...campaignData } = campaign;
    const supabaseCampaignData = mapToSupabaseCampaign(campaignData);
    
    const { data, error } = await supabase
      .from('campaigns')
      .update(supabaseCampaignData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la mise à jour de la campagne');
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée lors de la mise à jour de la campagne');
    }
    
    // Convert from snake_case back to our frontend type
    const updatedCampaign = mapToCampaign(data);
    
    // Check if budget is balanced
    const balanced = isBudgetBalanced(updatedCampaign);
    
    // Show appropriate toast
    if (!balanced) {
      toast.warning(`La campagne "${updatedCampaign.name}" a un budget non alloué. Veuillez vérifier les allocations hebdomadaires.`);
    } else {
      toast.success(`Campagne "${updatedCampaign.name}" mise à jour avec succès`);
    }
    
    return updatedCampaign;
  } catch (error) {
    console.error('Error updating campaign:', error);
    toast.error(`Erreur lors de la mise à jour de la campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}

export async function updateWeeklyBudgetService(
  campaignId: string, 
  weekLabel: string, 
  amount: number
): Promise<void> {
  try {
    // First, get the current campaign
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError) {
      return supabaseService.handleError(campaignError, 'Erreur lors de la récupération de la campagne');
    }
    
    if (!campaignData) {
      throw new Error('Campagne non trouvée');
    }
    
    // Map to our frontend type
    const campaign = mapToCampaign(campaignData);
    
    // Update the weekly budgets
    const updatedWeeklyBudgets = {
      ...campaign.weeklyBudgets,
      [weekLabel]: amount
    };
    
    // Update in Supabase
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        weekly_budgets: updatedWeeklyBudgets
      })
      .eq('id', campaignId);
    
    if (updateError) {
      return supabaseService.handleError(updateError, 'Erreur lors de la mise à jour du budget hebdomadaire');
    }
    
    console.log(`Weekly budget updated for campaign ${campaignId}, week ${weekLabel}: ${amount}`);
  } catch (error) {
    console.error('Error updating weekly budget:', error);
    toast.error(`Erreur lors de la mise à jour du budget hebdomadaire: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}

export async function updateActualBudgetService(
  campaignId: string,
  weekLabel: string, 
  amount: number
): Promise<void> {
  try {
    // First, get the current campaign
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError) {
      return supabaseService.handleError(campaignError, 'Erreur lors de la récupération de la campagne');
    }
    
    if (!campaignData) {
      throw new Error('Campagne non trouvée');
    }
    
    // Map to our frontend type
    const campaign = mapToCampaign(campaignData);
    
    // Update the actual budgets
    const updatedActualBudgets = {
      ...campaign.actualBudgets,
      [weekLabel]: amount
    };
    
    // Update in Supabase
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        actual_budgets: updatedActualBudgets
      })
      .eq('id', campaignId);
    
    if (updateError) {
      return supabaseService.handleError(updateError, 'Erreur lors de la mise à jour du budget réel');
    }
    
    console.log(`Actual budget updated for campaign ${campaignId}, week ${weekLabel}: ${amount}`);
  } catch (error) {
    console.error('Error updating actual budget:', error);
    toast.error(`Erreur lors de la mise à jour du budget réel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}
