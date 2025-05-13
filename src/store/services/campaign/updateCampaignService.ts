
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { formatSupabaseError } from '@/utils/supabaseUtils';
import { isBudgetBalanced } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';

// Update an existing campaign
export async function updateCampaignService(
  id: string, 
  data: Partial<Campaign>,
  campaigns: Campaign[]
): Promise<void> {
  try {
    // Convert to snake_case for Supabase
    const updateData: Record<string, any> = {};
    
    if ('mediaChannel' in data) updateData.media_channel = data.mediaChannel;
    if ('name' in data) updateData.name = data.name;
    if ('objective' in data) updateData.objective = data.objective;
    if ('targetAudience' in data) updateData.target_audience = data.targetAudience;
    if ('startDate' in data) updateData.start_date = data.startDate;
    if ('totalBudget' in data) updateData.total_budget = data.totalBudget;
    if ('durationDays' in data) updateData.duration_days = data.durationDays;
    if ('weeklyBudgets' in data) updateData.weekly_budgets = data.weeklyBudgets;
    
    console.log('Attempting to update campaign with ID:', id, 'and data:', updateData);
    
    const { error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      return supabaseService.handleError(error, 'Supabase update error');
    }
    
    const campaignIndex = campaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      console.error(`Campaign with ID ${id} not found`);
      return;
    }
    
    const updatedCampaign = {
      ...campaigns[campaignIndex],
      ...data,
    };
    
    console.log(`Campaign "${updatedCampaign.name}" updated:`, data);
    
    // Check if budget is balanced after update
    if ('totalBudget' in data || 'weeklyBudgets' in data) {
      const balanced = isBudgetBalanced(updatedCampaign);
      
      if (!balanced) {
        toast.warning(`La campagne "${updatedCampaign.name}" a un budget non alloué. Veuillez vérifier les allocations hebdomadaires.`);
      }
    }
  } catch (error) {
    console.error('Error updating campaign:', error);
    toast.error(`Erreur lors de la mise à jour de la campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}
