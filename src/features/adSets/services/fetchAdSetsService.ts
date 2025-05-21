
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToAdSet } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { supabaseService } from '@/store/services/base/supabaseService';

export async function fetchAdSetsForCampaign(campaignId: string): Promise<AdSet[]> {
  try {
    console.log('Fetching ad sets for campaign ID:', campaignId);
    
    const { data, error } = await supabase
      .from('ad_sets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error when fetching ad sets:', error);
      return supabaseService.handleError(error, 'Erreur lors de la récupération des sous-ensembles');
    }
    
    if (!data || data.length === 0) {
      console.log('No ad sets found for campaign:', campaignId);
      return [];
    }
    
    const adSets = (data || []).map(item => {
      const adSet = mapToAdSet(item);
      // S'assurer que actualBudgets est au moins un objet vide
      if (!adSet.actualBudgets) {
        adSet.actualBudgets = {};
      }
      return adSet;
    });
    
    console.log('Ad sets fetched successfully:', adSets.length, 'for campaign:', campaignId);
    return adSets;
  } catch (error) {
    console.error('Error fetching ad sets:', error);
    toast.error(`Erreur lors de la récupération des sous-ensembles: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return [];
  }
}
