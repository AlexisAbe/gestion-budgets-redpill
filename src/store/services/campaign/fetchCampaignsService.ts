
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToCampaign, formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';
import { supabaseService } from '../base/supabaseService';

// Fetch all campaigns from the database
export async function fetchCampaignsService(): Promise<Campaign[]> {
  try {
    console.log('Fetching campaigns from Supabase...');
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      const errorMessage = formatSupabaseError(error);
      console.error('Supabase fetch error:', error, errorMessage);
      throw new Error(errorMessage);
    }
    
    // Map database response to our frontend Campaign type
    const campaigns = (data || []).map(item => mapToCampaign(item));
    console.log('Campaigns fetched from Supabase:', campaigns.length);
    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    toast.error('Erreur lors de la récupération des campagnes');
    return [];
  }
}
