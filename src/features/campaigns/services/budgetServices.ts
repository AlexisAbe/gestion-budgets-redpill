
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function updateWeeklyBudgetService(
  campaignId: string, 
  weekLabel: string, 
  amount: number
): Promise<boolean> {
  try {
    // First get the current campaign to access its weekly budgets
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('weekly_budgets')
      .eq('id', campaignId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching campaign for budget update:', fetchError);
      toast.error(`Erreur lors de la récupération de la campagne: ${fetchError.message}`);
      return false;
    }
    
    // Update the weekly budgets
    const weeklyBudgets = campaign.weekly_budgets as Record<string, any> || {};
    weeklyBudgets[weekLabel] = amount;
    
    // Update the campaign with the new weekly budgets
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        weekly_budgets: weeklyBudgets,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);
      
    if (updateError) {
      console.error('Error updating campaign weekly budget:', updateError);
      toast.error(`Erreur lors de la mise à jour du budget hebdomadaire: ${updateError.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateWeeklyBudgetService:', error);
    toast.error(`Erreur lors de la mise à jour du budget hebdomadaire: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}

export async function updateActualBudgetService(
  campaignId: string, 
  weekLabel: string, 
  amount: number
): Promise<boolean> {
  try {
    // First get the current campaign to access its weekly budgets
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('weekly_budgets, actual_budgets')
      .eq('id', campaignId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching campaign for actual budget update:', fetchError);
      toast.error(`Erreur lors de la récupération de la campagne: ${fetchError.message}`);
      return false;
    }
    
    // Get or initialize the actual budgets
    const actualBudgets = campaign.actual_budgets as Record<string, any> || {};
    
    // Update the actual budget for the specified week
    actualBudgets[weekLabel] = amount;
    
    // Update the campaign with the modified actual budgets
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        actual_budgets: actualBudgets,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);
      
    if (updateError) {
      console.error('Error updating campaign actual budget:', updateError);
      toast.error(`Erreur lors de la mise à jour du budget réel: ${updateError.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateActualBudgetService:', error);
    toast.error(`Erreur lors de la mise à jour du budget réel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}

// Synchroniser les budgets réels des sous-ensembles pour une semaine spécifique
export async function syncAdSetsActualBudgetsForWeek(
  campaignId: string,
  weekLabel: string
): Promise<boolean> {
  try {
    // Récupérer tous les sous-ensembles pour cette campagne
    const { data: adSets, error: adSetsError } = await supabase
      .from('ad_sets')
      .select('id, actual_budgets')
      .eq('campaign_id', campaignId);
      
    if (adSetsError) {
      console.error('Error fetching ad sets for budget sync:', adSetsError);
      return false;
    }
    
    // Calculer le total des budgets réels pour cette semaine
    let totalActualBudget = 0;
    adSets.forEach(adSet => {
      const actualBudgets = adSet.actual_budgets as Record<string, number> || {};
      if (actualBudgets[weekLabel]) {
        totalActualBudget += actualBudgets[weekLabel];
      }
    });
    
    // Mettre à jour le budget réel de la campagne pour cette semaine
    return await updateActualBudgetService(campaignId, weekLabel, totalActualBudget);
    
  } catch (error) {
    console.error('Error syncing ad sets actual budgets:', error);
    return false;
  }
}
