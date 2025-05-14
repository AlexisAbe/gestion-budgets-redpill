
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '../base/supabaseService';

export async function fetchAdSetsService(campaignId: string): Promise<AdSet[]> {
  try {
    const { data, error } = await supabase
      .from('ad_sets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });
    
    if (error) {
      return supabaseService.handleError(error, 'Error fetching ad sets');
    }
    
    if (!data) return [];
    
    return data.map(adSet => ({
      id: adSet.id,
      campaignId: adSet.campaign_id,
      name: adSet.name,
      budgetPercentage: adSet.budget_percentage,
      description: adSet.description || undefined,
      targetAudience: adSet.target_audience || undefined,
      actualBudgets: adSet.actual_budgets ? adSet.actual_budgets as Record<string, number> : undefined,
      // Add safe handling for weekly_notes which might not exist in database yet
      weeklyNotes: adSet.weekly_notes ? adSet.weekly_notes as Record<string, string> : undefined,
      createdAt: adSet.created_at,
      updatedAt: adSet.updated_at
    }));
  } catch (error) {
    console.error('Error in fetchAdSetsService:', error);
    throw error;
  }
}

export async function addAdSetService(adSet: Omit<AdSet, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdSet> {
  try {
    const { data, error } = await supabase
      .from('ad_sets')
      .insert({
        campaign_id: adSet.campaignId,
        name: adSet.name,
        budget_percentage: adSet.budgetPercentage,
        description: adSet.description || null,
        target_audience: adSet.targetAudience || null,
        weekly_notes: adSet.weeklyNotes || null // Add weekly_notes field
      })
      .select()
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Error adding ad set');
    }
    
    if (!data) {
      throw new Error('No data returned when adding ad set');
    }
    
    toast.success(`Ad set "${adSet.name}" added successfully`);
    
    return {
      id: data.id,
      campaignId: data.campaign_id,
      name: data.name,
      budgetPercentage: data.budget_percentage,
      description: data.description || undefined,
      targetAudience: data.target_audience || undefined,
      // Safely handle data that might not exist yet in DB
      actualBudgets: data.actual_budgets ? data.actual_budgets as Record<string, number> : undefined,
      weeklyNotes: data.weekly_notes ? data.weekly_notes as Record<string, string> : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in addAdSetService:', error);
    throw error;
  }
}

export async function updateAdSetService(
  adSetId: string,
  updates: Partial<AdSet>
): Promise<AdSet> {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.budgetPercentage !== undefined) updateData.budget_percentage = updates.budgetPercentage;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetAudience !== undefined) updateData.target_audience = updates.targetAudience;
    if (updates.weeklyNotes !== undefined) updateData.weekly_notes = updates.weeklyNotes;
    
    const { data, error } = await supabase
      .from('ad_sets')
      .update(updateData)
      .eq('id', adSetId)
      .select()
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Error updating ad set');
    }
    
    if (!data) {
      throw new Error('No data returned when updating ad set');
    }
    
    toast.success(`Ad set "${data.name}" updated successfully`);
    
    return {
      id: data.id,
      campaignId: data.campaign_id,
      name: data.name,
      budgetPercentage: data.budget_percentage,
      description: data.description || undefined,
      targetAudience: data.target_audience || undefined,
      actualBudgets: data.actual_budgets ? data.actual_budgets as Record<string, number> : undefined,
      weeklyNotes: data.weekly_notes ? data.weekly_notes as Record<string, string> : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in updateAdSetService:', error);
    throw error;
  }
}

export async function deleteAdSetService(adSetId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('ad_sets')
      .delete()
      .eq('id', adSetId);
    
    if (error) {
      return supabaseService.handleError(error, 'Error deleting ad set');
    }
    
    toast.success('Ad set deleted successfully');
  } catch (error) {
    console.error('Error in deleteAdSetService:', error);
    throw error;
  }
}

export async function updateAdSetWeeklyNoteService(
  adSetId: string,
  weekLabel: string,
  note: string
): Promise<void> {
  try {
    // First, get the current ad set
    const { data, error } = await supabase
      .from('ad_sets')
      .select('*')
      .eq('id', adSetId)
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Erreur lors de la récupération de l\'ad set');
    }
    
    // Get current notes or create empty object if it doesn't exist
    const currentNotes = data.weekly_notes || {};
    
    // Update the notes for the specified week
    const updatedWeeklyNotes = {
      ...currentNotes,
      [weekLabel]: note
    };
    
    // Update in Supabase
    const { error: updateError } = await supabase
      .from('ad_sets')
      .update({ weekly_notes: updatedWeeklyNotes })
      .eq('id', adSetId);
    
    if (updateError) {
      return supabaseService.handleError(updateError, 'Erreur lors de la mise à jour de la note');
    }
  } catch (error) {
    console.error('Error updating ad set weekly note:', error);
    throw error;
  }
}
