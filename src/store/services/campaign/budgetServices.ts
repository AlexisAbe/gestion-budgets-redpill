import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';
import { distributeByPercentages, distributeEvenlyAcrossWeeks, distributeByCurve } from '@/utils/budgetUtils';
import { mapToCampaign } from '@/utils/supabaseUtils';

// Update the weekly budget for a campaign
export async function updateWeeklyBudgetService(
  campaignId: string, 
  weekLabel: string, 
  amount: number
): Promise<void> {
  try {
    // Get the campaign from the database
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Campaign not found');
    }
    
    // Convert the database format to our Campaign type
    const campaign = mapToCampaign(data);
    
    const newWeeklyBudgets = { ...campaign.weeklyBudgets };
    
    // Update the budget for the specified week
    newWeeklyBudgets[weekLabel] = amount;
    
    console.log('Updating weekly budget for campaign ID:', campaignId, 'week:', weekLabel, 'amount:', amount);
    
    // Update in Supabase
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ weekly_budgets: newWeeklyBudgets })
      .eq('id', campaignId);
    
    if (updateError) {
      return supabaseService.handleError(updateError, 'Supabase update error');
    }
    
    console.log(`Weekly budget updated for campaign "${campaign.name}"`, {
      week: weekLabel,
      amount
    });
  } catch (error) {
    console.error('Error updating weekly budget:', error);
    toast.error(`Erreur lors de la mise à jour du budget hebdomadaire: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}

// Auto-distribute the budget for a campaign
export async function autoDistributeBudgetService(
  campaignId: string, 
  method: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual',
  campaigns: Campaign[],
  weeks: WeeklyView[],
  percentages?: Record<string, number>
): Promise<void> {
  try {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return;
    }
    
    let newWeeklyBudgets: Record<string, number> = {};
    
    // Distribute based on selected method
    if (method === 'manual' && percentages) {
      newWeeklyBudgets = distributeByPercentages(campaign, percentages);
    } else if (method === 'even') {
      newWeeklyBudgets = distributeEvenlyAcrossWeeks(campaign, weeks);
    } else if (method === 'front-loaded' || method === 'back-loaded' || method === 'bell-curve') {
      // Only pass valid curve types to distributeByCurve
      newWeeklyBudgets = distributeByCurve(campaign, weeks, method);
    } else {
      console.error(`Invalid distribution method: ${method}`);
      return;
    }
    
    console.log('Auto-distributing budget for campaign ID:', campaignId, 'using method:', method);
    
    // Update in Supabase
    const { error } = await supabase
      .from('campaigns')
      .update({ weekly_budgets: newWeeklyBudgets })
      .eq('id', campaignId);
    
    if (error) {
      return supabaseService.handleError(error, 'Supabase update error');
    }
    
    console.log(`Budget auto-distributed for campaign "${campaign.name}" using ${method} method`);
    toast.success(`Le budget pour "${campaign.name}" a été automatiquement distribué`);
  } catch (error) {
    console.error('Error auto-distributing budget:', error);
    toast.error(`Erreur lors de la distribution automatique du budget: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}

// Add a note for a specific week in a campaign
export async function updateWeeklyNoteService(
  campaignId: string,
  weekLabel: string,
  note: string
): Promise<void> {
  try {
    console.log(`Updating weekly note for campaign ${campaignId}, week ${weekLabel}`);
    
    // First, get the current campaign
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la récupération de la campagne');
    }
    
    // Convert the database format to our Campaign type
    const campaign = mapToCampaign(data);
    
    // Get current notes or create empty object if it doesn't exist
    const currentNotes = campaign.weeklyNotes || {};
    
    // Update the notes for the specified week
    const updatedWeeklyNotes = {
      ...currentNotes,
      [weekLabel]: note
    };
    
    // Update in Supabase
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        weekly_notes: updatedWeeklyNotes 
      })
      .eq('id', campaignId);
    
    if (updateError) {
      return supabaseService.handleError(updateError, 'Supabase update error');
    }
    
    console.log(`Weekly note updated for campaign "${campaign.name}"`, {
      week: weekLabel,
      note: note.substring(0, 20) + (note.length > 20 ? '...' : '')
    });
  } catch (error) {
    console.error('Error updating weekly note:', error);
    toast.error(`Erreur lors de la mise à jour de la note: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}

// Add a note for a specific week in an ad set
export async function updateAdSetWeeklyNoteService(
  adSetId: string,
  weekLabel: string,
  note: string
): Promise<void> {
  try {
    console.log(`Updating weekly note for ad set ${adSetId}, week ${weekLabel}`);
    
    // First, get the current ad set
    const { data, error } = await supabase
      .from('ad_sets')
      .select('*')
      .eq('id', adSetId)
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la récupération de l\'ad set');
    }
    
    // Get current notes or create empty object if it doesn't exist
    const currentNotes = data.weekly_notes || {};
    
    // Update the notes for the specified week
    const updatedWeeklyNotes = {
      ...currentNotes,
      [weekLabel]: note
    };
    
    // Update in Supabase
    const { error: updateError } = await supabase
      .from('ad_sets')
      .update({ 
        weekly_notes: updatedWeeklyNotes 
      })
      .eq('id', adSetId);
    
    if (updateError) {
      return supabaseService.handleError(updateError, 'Supabase update error');
    }
    
    console.log(`Weekly note updated for ad set "${data.name}"`, {
      week: weekLabel,
      note: note.substring(0, 20) + (note.length > 20 ? '...' : '')
    });
  } catch (error) {
    console.error('Error updating ad set weekly note:', error);
    toast.error(`Erreur lors de la mise à jour de la note: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}
