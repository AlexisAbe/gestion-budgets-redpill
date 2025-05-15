
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '../base/supabaseService';

export async function deleteAdSet(id: string, name: string): Promise<boolean> {
  try {
    console.log('Deleting ad set:', id);
    
    const { error } = await supabase
      .from('ad_sets')
      .delete()
      .eq('id', id);
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la suppression du sous-ensemble');
    }
    
    console.log('Ad set deleted successfully:', id);
    
    toast({
      title: "Succès",
      description: `Sous-ensemble "${name}" supprimé avec succès`,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting ad set:', error);
    toast({
      title: "Erreur",
      description: `Erreur lors de la suppression du sous-ensemble: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      variant: "destructive"
    });
    return false;
  }
}
