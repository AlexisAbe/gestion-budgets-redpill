
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToAdSet, mapToSupabaseAdSet } from '@/utils/supabaseUtils';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '../base/supabaseService';

export async function addAdSet(adSet: Omit<AdSet, "id" | "createdAt" | "updatedAt">): Promise<AdSet | null> {
  try {
    console.log('Adding ad set:', adSet);
    
    const supabaseAdSet = mapToSupabaseAdSet(adSet);
    
    const { data, error } = await supabase
      .from('ad_sets')
      .insert(supabaseAdSet)
      .select()
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de l\'ajout du sous-ensemble');
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée lors de la création du sous-ensemble');
    }
    
    const newAdSet = mapToAdSet(data);
    console.log('Ad set added successfully:', newAdSet);
    
    toast({
      title: "Succès",
      description: `Sous-ensemble "${newAdSet.name}" ajouté avec succès`,
    });
    
    return newAdSet;
  } catch (error) {
    console.error('Error adding ad set:', error);
    toast({
      title: "Erreur",
      description: `Erreur lors de l'ajout du sous-ensemble: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      variant: "destructive"
    });
    return null;
  }
}
