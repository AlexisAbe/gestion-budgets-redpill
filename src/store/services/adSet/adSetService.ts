
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToAdSet, mapToSupabaseAdSet } from '@/utils/supabaseUtils';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '../base/supabaseService';

export async function fetchAdSetsForCampaign(campaignId: string): Promise<AdSet[]> {
  try {
    console.log('Fetching ad sets for campaign ID:', campaignId);
    
    const { data, error } = await supabase
      .from('ad_sets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la récupération des sous-ensembles');
    }
    
    const adSets = (data || []).map(item => mapToAdSet(item));
    console.log('Ad sets fetched:', adSets.length);
    return adSets;
  } catch (error) {
    console.error('Error fetching ad sets:', error);
    toast({
      title: "Erreur",
      description: `Erreur lors de la récupération des sous-ensembles: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      variant: "destructive"
    });
    return [];
  }
}

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

export async function updateAdSet(id: string, updates: Partial<AdSet>): Promise<AdSet | null> {
  try {
    console.log('Updating ad set:', id, updates);
    
    // Convert to snake_case for Supabase
    const updateData: Record<string, any> = {};
    
    if ('name' in updates) updateData.name = updates.name;
    if ('budgetPercentage' in updates) updateData.budget_percentage = updates.budgetPercentage;
    if ('description' in updates) updateData.description = updates.description;
    if ('targetAudience' in updates) updateData.target_audience = updates.targetAudience;
    if ('actualBudgets' in updates) updateData.actual_budgets = updates.actualBudgets;
    
    const { data, error } = await supabase
      .from('ad_sets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la mise à jour du sous-ensemble');
    }
    
    if (!data) {
      throw new Error('Aucune donnée retournée lors de la mise à jour du sous-ensemble');
    }
    
    const updatedAdSet = mapToAdSet(data);
    console.log('Ad set updated successfully:', updatedAdSet);
    
    toast({
      title: "Succès",
      description: `Sous-ensemble "${updatedAdSet.name}" mis à jour avec succès`,
    });
    
    return updatedAdSet;
  } catch (error) {
    console.error('Error updating ad set:', error);
    toast({
      title: "Erreur",
      description: `Erreur lors de la mise à jour du sous-ensemble: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      variant: "destructive"
    });
    return null;
  }
}

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

export async function updateAdSetActualBudget(id: string, weekLabel: string, amount: number): Promise<boolean> {
  try {
    // Get current ad set
    const { data: adSetData, error: adSetError } = await supabase
      .from('ad_sets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (adSetError) {
      return supabaseService.handleError(adSetError, 'Erreur lors de la récupération du sous-ensemble');
    }
    
    if (!adSetData) {
      throw new Error('Sous-ensemble non trouvé');
    }
    
    // Update actual budgets
    const currentActualBudgets = adSetData.actual_budgets || {};
    const updatedActualBudgets = {
      ...currentActualBudgets,
      [weekLabel]: amount
    };
    
    // Save to database
    const { error: updateError } = await supabase
      .from('ad_sets')
      .update({ actual_budgets: updatedActualBudgets })
      .eq('id', id);
    
    if (updateError) {
      return supabaseService.handleError(updateError, 'Erreur lors de la mise à jour du budget réel');
    }
    
    console.log('Ad set actual budget updated successfully:', id, weekLabel, amount);
    return true;
  } catch (error) {
    console.error('Error updating ad set actual budget:', error);
    toast({
      title: "Erreur",
      description: `Erreur lors de la mise à jour du budget réel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      variant: "destructive"
    });
    return false;
  }
}

export async function validateAdSetBudgets(campaignId: string): Promise<{ valid: boolean, total: number }> {
  try {
    const adSets = await fetchAdSetsForCampaign(campaignId);
    
    const totalPercentage = adSets.reduce((sum, adSet) => sum + adSet.budgetPercentage, 0);
    
    return {
      valid: totalPercentage <= 100,
      total: totalPercentage
    };
  } catch (error) {
    console.error('Error validating ad set budgets:', error);
    return { valid: false, total: 0 };
  }
}
