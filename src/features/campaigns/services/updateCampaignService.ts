
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function updateCampaignService(
  campaignId: string, 
  updates: Partial<Campaign>
): Promise<boolean> {
  try {
    // Convert frontend model to database model
    const dbUpdates: Record<string, any> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.mediaChannel !== undefined) dbUpdates.media_channel = updates.mediaChannel;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.durationDays !== undefined) dbUpdates.duration_days = updates.durationDays;
    if (updates.objective !== undefined) dbUpdates.objective = updates.objective;
    if (updates.targetAudience !== undefined) dbUpdates.target_audience = updates.targetAudience;
    if (updates.totalBudget !== undefined) dbUpdates.total_budget = updates.totalBudget;
    if (updates.weeklyBudgets !== undefined) dbUpdates.weekly_budgets = updates.weeklyBudgets;
    if (updates.actualBudgets !== undefined) dbUpdates.actual_budgets = updates.actualBudgets;
    
    // Add updated timestamp
    dbUpdates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('campaigns')
      .update(dbUpdates)
      .eq('id', campaignId);
      
    if (error) {
      console.error('Error updating campaign:', error);
      toast.error(`Erreur lors de la mise à jour de la campagne: ${error.message}`);
      return false;
    }
    
    toast.success('Campagne mise à jour avec succès');
    return true;
  } catch (error) {
    console.error('Error in updateCampaignService:', error);
    toast.error(`Erreur lors de la mise à jour de la campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}
