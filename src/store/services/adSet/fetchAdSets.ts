
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToAdSet } from '@/utils/supabaseUtils';
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
      console.error('Supabase error when fetching ad sets:', error);
      return supabaseService.handleError(error, 'Erreur lors de la récupération des sous-ensembles');
    }
    
    if (!data || data.length === 0) {
      console.log('No ad sets found for campaign:', campaignId);
      return [];
    }
    
    const adSets = (data || []).map(item => mapToAdSet(item));
    console.log('Ad sets fetched successfully:', adSets.length, 'for campaign:', campaignId);
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
