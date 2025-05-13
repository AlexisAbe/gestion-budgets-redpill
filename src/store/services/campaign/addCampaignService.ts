
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { mapToSupabaseCampaign } from '@/utils/supabaseUtils';
import { isBudgetBalanced, distributeEvenlyAcrossWeeks } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabaseService } from '../base/supabaseService';
import { fetchCampaignsService } from './fetchCampaignsService';

// Add a new campaign to the database
export async function addCampaignService(
  campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    console.log('Starting campaign creation process...');
    console.log('Campaign data includes client ID:', campaignData.clientId);
    
    // Auto-distribute budget evenly if no weekly budgets provided
    if (Object.keys(campaignData.weeklyBudgets).length === 0) {
      console.log('No weekly budgets provided, auto-distributing...');
      
      // Instead of querying a weeks table, we'll create a set of default weeks
      // This is a temporary solution - ideally the weeks data should come from a proper source
      const defaultWeeks: WeeklyView[] = Array.from({ length: 4 }, (_, i) => {
        const weekNumber = i + 1;
        return {
          weekNumber,
          weekLabel: `W${weekNumber}`,
          startDate: new Date(new Date().setDate(new Date().getDate() + i * 7)).toISOString(),
          endDate: new Date(new Date().setDate(new Date().getDate() + (i + 1) * 7 - 1)).toISOString()
        };
      });
      
      campaignData.weeklyBudgets = distributeEvenlyAcrossWeeks(
        { ...campaignData, id: '', createdAt: '', updatedAt: '' } as Campaign,
        defaultWeeks
      );
    }
    
    // Generate a UUID for the campaign
    const campaignId = uuidv4();
    
    // Convert to snake_case for Supabase
    const supabaseCampaignData = mapToSupabaseCampaign(campaignData);
    
    // Add the id to the data
    const dataWithId = {
      ...supabaseCampaignData,
      id: campaignId,
      // We're explicitly setting created_by to null to avoid any auth issues
      created_by: null
    };
    
    console.log('Attempting to insert campaign with data:', {
      name: dataWithId.name,
      media_channel: dataWithId.media_channel,
      id: campaignId,
      client_id: dataWithId.client_id
    });
    
    const { data, error } = await supabase
      .from('campaigns')
      .insert(dataWithId)
      .select()
      .single();
    
    if (error) {
      return supabaseService.handleError(error, 'Supabase insert error');
    }
    
    if (!data) {
      console.error('No data returned from insert operation');
      throw new Error('Aucune donnée retournée lors de la création de la campagne');
    }
    
    // At this point, we've successfully created the campaign
    const campaigns = await fetchCampaignsService();
    const newCampaign = campaigns.find(c => c.id === campaignId);
    
    if (!newCampaign) {
      console.warn(`Campaign was created with ID ${campaignId} but couldn't be found in the results.`);
    } else {
      // Check if budget is balanced
      const balanced = isBudgetBalanced(newCampaign);
      
      if (!balanced) {
        toast.warning(`La campagne "${newCampaign.name}" a un budget non alloué. Veuillez vérifier les allocations hebdomadaires.`);
      } else {
        toast.success(`Campagne "${newCampaign.name}" ajoutée avec succès`);
      }
    }
    
    return campaignId;
  } catch (error) {
    console.error('Error adding campaign:', error);
    toast.error(`Erreur lors de l'ajout de la campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    throw error;
  }
}
