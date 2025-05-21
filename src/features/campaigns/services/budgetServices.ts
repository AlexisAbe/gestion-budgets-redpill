
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
    const weeklyBudgets = campaign.weekly_budgets || {};
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
    // First get the current campaign to access its actual budgets
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('actual_budgets')
      .eq('id', campaignId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching campaign for actual budget update:', fetchError);
      toast.error(`Erreur lors de la récupération de la campagne: ${fetchError.message}`);
      return false;
    }
    
    // Update the actual budgets
    const actualBudgets = campaign.actual_budgets || {};
    actualBudgets[weekLabel] = amount;
    
    // Update the campaign with the new actual budgets
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
