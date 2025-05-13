
import { supabase } from '@/integrations/supabase/client';
import { formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';

// Reset the store
export async function resetStoreService(): Promise<void> {
  try {
    console.log('Attempting to reset store by deleting all campaigns');
    
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all campaigns
    
    if (error) {
      return supabaseService.handleError(error, 'Supabase delete error');
    }
    
    console.log("Store reset to initial state");
    toast.info("Toutes les données des campagnes ont été réinitialisées");
  } catch (error) {
    console.error('Error resetting store:', error);
    toast.error(`Erreur lors de la réinitialisation des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}
