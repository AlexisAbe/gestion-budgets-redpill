
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

// Create a single supabase client for interacting with your database
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Name of the backup table where we'll store our backups
const BACKUP_TABLE = 'campaign_backups';

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting campaign backup process...');
    const timestamp = new Date().toISOString();
    
    // Fetch all campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*');
    
    if (campaignsError) {
      throw new Error(`Error fetching campaigns: ${campaignsError.message}`);
    }
    
    // Fetch all ad sets
    const { data: adSets, error: adSetsError } = await supabase
      .from('ad_sets')
      .select('*');
    
    if (adSetsError) {
      throw new Error(`Error fetching ad sets: ${adSetsError.message}`);
    }
    
    // Create backup record with all data
    const backupData = {
      timestamp,
      backup_type: 'scheduled',
      campaigns_data: campaigns,
      ad_sets_data: adSets,
    };
    
    // Insert backup record
    const { error: insertError } = await supabase
      .from(BACKUP_TABLE)
      .insert(backupData);
    
    if (insertError) {
      throw new Error(`Error creating backup: ${insertError.message}`);
    }
    
    console.log(`Backup completed successfully at ${timestamp}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup completed successfully',
        timestamp,
        itemsBackedUp: {
          campaigns: campaigns.length,
          adSets: adSets.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Backup error:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
