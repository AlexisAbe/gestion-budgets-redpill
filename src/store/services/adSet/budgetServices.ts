
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '../base/supabaseService';

export async function updateAdSetActualBudget(id: string, weekLabel: string, amount: number): Promise<boolean> {
  try {
    console.log(`Updating ad set ${id} actual budget for week ${weekLabel}: ${amount}`);
    
    // Get current ad set
    const { data: adSetData, error: adSetError } = await supabase
      .from('ad_sets')
      .select('actual_budgets')
      .eq('id', id)
      .maybeSingle();
    
    if (adSetError) {
      return supabaseService.handleError(adSetError, 'Erreur lors de la récupération du sous-ensemble');
    }
    
    if (!adSetData) {
      toast({
        title: "Erreur",
        description: 'Sous-ensemble non trouvé',
        variant: "destructive"
      });
      return false;
    }
    
    // Ensure actual_budgets is an object by using a default empty object
    const currentActualBudgets = adSetData.actual_budgets ? 
      (typeof adSetData.actual_budgets === 'object' ? adSetData.actual_budgets : {}) : 
      {};
      
    // Create updated object for actual budgets
    const updatedActualBudgets = {
      ...currentActualBudgets,
      [weekLabel]: amount
    };
    
    console.log('Updating ad set actual budgets:', updatedActualBudgets);
    
    // Save to database
    const { error: updateError } = await supabase
      .from('ad_sets')
      .update({ actual_budgets: updatedActualBudgets })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating ad set actual budget:', updateError);
      return supabaseService.handleError(updateError, 'Erreur lors de la mise à jour du budget réel');
    }
    
    console.log('Ad set actual budget updated successfully:', id, weekLabel, amount);
    return true;
  } catch (error) {
    console.error('Error updating ad set actual budget:', error);
    toast({
      title: "Erreur",
      description: `Erreur lors de la mise à jour du budget réel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      variant: "destructive"
    });
    return false;
  }
}
