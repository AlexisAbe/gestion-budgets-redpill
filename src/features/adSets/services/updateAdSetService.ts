
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function updateAdSetService(adSetId: string, updates: Partial<AdSet>): Promise<AdSet | null> {
  try {
    // Convert frontend model to database model
    const dbUpdates: Record<string, any> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.budgetPercentage !== undefined) dbUpdates.budget_percentage = updates.budgetPercentage;
    if (updates.targetAudience !== undefined) dbUpdates.target_audience = updates.targetAudience;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.actualBudgets !== undefined) dbUpdates.actual_budgets = updates.actualBudgets;
    
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('ad_sets')
      .update(dbUpdates)
      .eq('id', adSetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating ad set:', error);
      toast.error(`Erreur lors de la mise à jour du sous-ensemble: ${error.message}`);
      return null;
    }

    // Map back to our frontend type
    const result: AdSet = {
      id: data.id,
      campaignId: data.campaign_id,
      name: data.name,
      budgetPercentage: data.budget_percentage,
      targetAudience: data.target_audience || '',
      description: data.description || '',
      actualBudgets: data.actual_budgets as Record<string, number> || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    toast.success(`Sous-ensemble "${result.name}" mis à jour avec succès`);
    return result;
  } catch (error) {
    console.error('Error in updateAdSetService:', error);
    toast.error(`Erreur lors de la mise à jour du sous-ensemble: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
}
