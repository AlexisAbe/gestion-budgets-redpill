
import { supabase } from '@/integrations/supabase/client';
import { formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';

// Delete a campaign
export async function deleteCampaignService(id: string, campaignName: string = 'Unknown'): Promise<void> {
  try {
    console.log('Attempting to delete campaign with ID:', id);
    
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    
    if (error) {
      return supabaseService.handleError(error, 'Supabase delete error');
    }
    
    console.log(`Campaign "${campaignName}" deleted`);
    toast.info(`Campagne "${campaignName}" supprimée`);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    toast.error(`Erreur lors de la suppression de la campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}
