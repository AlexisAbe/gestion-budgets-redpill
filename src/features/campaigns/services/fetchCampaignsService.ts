
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { mapToCampaign, formatSupabaseError } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

// Fetch all campaigns from the database
export async function fetchCampaignsService(clientId?: string): Promise<Campaign[]> {
  try {
    console.log('Fetching campaigns from Supabase...', clientId ? `for client ${clientId}` : 'for all clients');
    
    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
      
    // Filter by client if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      const errorMessage = formatSupabaseError(error);
      console.error('Supabase fetch error:', error, errorMessage);
      throw new Error(errorMessage);
    }
    
    // Map database response to our frontend Campaign type
    const campaigns = (data || []).map(item => mapToCampaign(item));
    console.log('Campaigns fetched from Supabase:', campaigns.length, campaigns);
    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    toast.error('Erreur lors de la récupération des campagnes');
    return [];
  }
}
