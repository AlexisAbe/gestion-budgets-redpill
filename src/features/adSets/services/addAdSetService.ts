
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getValidUUID } from '@/utils/supabaseUtils';

export async function addAdSetService(adSetData: Omit<AdSet, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdSet | null> {
  try {
    // Prepare the data for insertion
    const newAdSet = {
      id: getValidUUID(''),
      campaign_id: adSetData.campaignId,
      name: adSetData.name,
      budget_percentage: adSetData.budgetPercentage,
      target_audience: adSetData.targetAudience || null,
      description: adSetData.description || null,
      actual_budgets: adSetData.actualBudgets || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ad_sets')
      .insert([newAdSet])
      .select()
      .single();

    if (error) {
      console.error('Error adding ad set:', error);
      toast.error(`Erreur lors de l'ajout du sous-ensemble: ${error.message}`);
      return null;
    }

    // Map to our frontend type
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

    toast.success(`Sous-ensemble "${result.name}" ajouté avec succès`);
    return result;
  } catch (error) {
    console.error('Error in addAdSetService:', error);
    toast.error(`Erreur lors de l'ajout du sous-ensemble: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
}
