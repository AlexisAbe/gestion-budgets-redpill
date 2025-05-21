
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function deleteAdSetService(adSetId: string, name: string = 'Sous-ensemble'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ad_sets')
      .delete()
      .eq('id', adSetId);

    if (error) {
      console.error('Error deleting ad set:', error);
      toast.error(`Erreur lors de la suppression du sous-ensemble: ${error.message}`);
      return false;
    }

    toast.success(`${name} supprimé avec succès`);
    return true;
  } catch (error) {
    console.error('Error in deleteAdSetService:', error);
    toast.error(`Erreur lors de la suppression du sous-ensemble: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}
