
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function deleteCampaignService(campaignId: string): Promise<boolean> {
  try {
    // First delete all ad sets for this campaign
    const { error: adSetsError } = await supabase
      .from('ad_sets')
      .delete()
      .eq('campaign_id', campaignId);
      
    if (adSetsError) {
      console.error('Error deleting campaign ad sets:', adSetsError);
      toast.error(`Erreur lors de la suppression des sous-ensembles: ${adSetsError.message}`);
      return false;
    }
    
    // Then delete the campaign
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);
      
    if (error) {
      console.error('Error deleting campaign:', error);
      toast.error(`Erreur lors de la suppression de la campagne: ${error.message}`);
      return false;
    }
    
    toast.success('Campagne supprimée avec succès');
    return true;
  } catch (error) {
    console.error('Error in deleteCampaignService:', error);
    toast.error(`Erreur lors de la suppression de la campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}
