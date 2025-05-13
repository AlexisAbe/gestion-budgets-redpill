
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';

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
      return supabaseService.handleError(error, 'Supabase update error');
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
      const { distributeEvenlyAcrossWeeks } = require('@/utils/budgetUtils');
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
