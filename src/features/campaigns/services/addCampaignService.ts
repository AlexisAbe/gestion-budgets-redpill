
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToCampaign } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

export async function addCampaignService(
  campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Campaign | null> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        name: campaign.name,
        client_id: campaign.clientId,
        media_channel: campaign.mediaChannel,
        start_date: campaign.startDate,
        duration_days: campaign.durationDays,
        objective: campaign.objective,
        target_audience: campaign.targetAudience,
        total_budget: campaign.totalBudget,
        weekly_budgets: campaign.weeklyBudgets || {},
        actual_budgets: campaign.actualBudgets || {},
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error adding campaign:', error);
      toast.error(`Erreur lors de la création de la campagne: ${error.message}`);
      return null;
    }
    
    const newCampaign = mapToCampaign(data);
    toast.success(`Campagne "${newCampaign.name}" créée avec succès`);
    return newCampaign;
  } catch (error) {
    console.error('Error in addCampaignService:', error);
    toast.error(`Erreur lors de la création de la campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return null;
  }
}
