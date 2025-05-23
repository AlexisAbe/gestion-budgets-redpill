
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';
import { 
  distributeByPercentages, 
  distributeEvenlyAcrossWeeks, 
  distributeByCurve 
} from '@/utils/budget/distribution';
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
  method: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global',
  campaigns: Campaign[],
  weeks: WeeklyView[],
  percentages?: Record<string, number>,
  selectedWeeks?: string[]
): Promise<void> {
  try {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return;
    }
    
    let newWeeklyBudgets: Record<string, number> = {};
    
    // Si des semaines spécifiques sont sélectionnées, on filtre les semaines
    const weeksToUse = selectedWeeks && selectedWeeks.length > 0
      ? weeks.filter(week => selectedWeeks.includes(week.weekLabel))
      : weeks;
    
    // Distribute based on selected method
    if ((method === 'manual' || method === 'global') && percentages) {
      // Si des semaines sont sélectionnées, on ne considère que les pourcentages pour ces semaines
      if (selectedWeeks && selectedWeeks.length > 0) {
        const filteredPercentages: Record<string, number> = {};
        
        // Copier uniquement les pourcentages des semaines sélectionnées
        selectedWeeks.forEach(weekLabel => {
          if (percentages[weekLabel] !== undefined) {
            filteredPercentages[weekLabel] = percentages[weekLabel];
          }
        });
        
        newWeeklyBudgets = distributeByPercentages(campaign, filteredPercentages);
      } else {
        newWeeklyBudgets = distributeByPercentages(campaign, percentages);
      }
    } else if (method === 'even') {
      newWeeklyBudgets = distributeEvenlyAcrossWeeks(campaign, weeksToUse);
    } else if (method === 'front-loaded' || method === 'back-loaded' || method === 'bell-curve') {
      // Only pass valid curve types to distributeByCurve
      newWeeklyBudgets = distributeByCurve(campaign, weeksToUse, method);
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
