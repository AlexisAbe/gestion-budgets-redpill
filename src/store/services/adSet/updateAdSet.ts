
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToAdSet } from '@/utils/supabaseUtils';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '../base/supabaseService';

export async function updateAdSet(id: string, updates: Partial<AdSet>): Promise<AdSet | null> {
  try {
    console.log('Updating ad set:', id, updates);
    
    // Convert to snake_case for Supabase
    const updateData: Record<string, any> = {};
    
    if ('name' in updates) updateData.name = updates.name;
    if ('budgetPercentage' in updates) updateData.budget_percentage = updates.budgetPercentage;
    if ('description' in updates) updateData.description = updates.description;
    if ('targetAudience' in updates) updateData.target_audience = updates.targetAudience;
    if ('actualBudgets' in updates) updateData.actual_budgets = updates.actualBudgets;
    if ('weeklyNotes' in updates) updateData.weekly_notes = updates.weeklyNotes;
    
    const { data, error } = await supabase
      .from('ad_sets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la mise à jour du sous-ensemble');
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée lors de la mise à jour du sous-ensemble');
    }
    
    const updatedAdSet = mapToAdSet(data);
    console.log('Ad set updated successfully:', updatedAdSet);
    
    toast({
      title: "Succès",
      description: `Sous-ensemble "${updatedAdSet.name}" mis à jour avec succès`,
    });
    
    return updatedAdSet;
  } catch (error) {
    console.error('Error updating ad set:', error);
    toast({
      title: "Erreur",
      description: `Erreur lors de la mise à jour du sous-ensemble: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      variant: "destructive"
    });
    return null;
  }
}
