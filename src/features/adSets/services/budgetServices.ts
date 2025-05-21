
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function updateAdSetActualBudgetService(
  adSetId: string, 
  weekLabel: string, 
  amount: number
): Promise<boolean> {
  try {
    // First get the current ad set to access its actual budgets
    const { data: adSet, error: fetchError } = await supabase
      .from('ad_sets')
      .select('actual_budgets')
      .eq('id', adSetId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching ad set for budget update:', fetchError);
      toast.error(`Erreur lors de la récupération du sous-ensemble: ${fetchError.message}`);
      return false;
    }
    
    // Update the actual budgets
    const actualBudgets = adSet.actual_budgets || {};
    actualBudgets[weekLabel] = amount;
    
    // Update the ad set with the new actual budgets
    const { error: updateError } = await supabase
      .from('ad_sets')
      .update({ 
        actual_budgets: actualBudgets,
        updated_at: new Date().toISOString()
      })
      .eq('id', adSetId);
      
    if (updateError) {
      console.error('Error updating ad set actual budget:', updateError);
      toast.error(`Erreur lors de la mise à jour du budget réel: ${updateError.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateAdSetActualBudgetService:', error);
    toast.error(`Erreur lors de la mise à jour du budget réel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}
