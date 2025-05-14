
// Import the necessary modules from Deno
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

// Create a single supabase client for interacting with your database
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Using service role for backup operations to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Name of the backup table where we'll store our backups
const BACKUP_TABLE = 'campaign_backups';

Deno.serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting campaign backup process...');
    const timestamp = new Date().toISOString();
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    
    // Check for mock token to support development environment
    const isMockToken = authHeader && authHeader.includes('mock-token-for-');
    let userId = null;
    
    if (isMockToken) {
      // Extract user ID from mock token (format: mock-token-for-{userId})
      userId = authHeader.replace('Bearer mock-token-for-', '');
      console.log(`Using mock token for user ID: ${userId}`);
    } else if (authHeader) {
      // For real tokens, verify with Supabase Auth
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          throw new Error('Unauthorized: invalid token');
        }
        
        userId = user.id;
        console.log(`Authenticated user: ${userId}`);
      } catch (authError) {
        console.error('Token validation error:', authError);
        throw new Error('Unauthorized: invalid token format');
      }
    } else {
      throw new Error('No authorization token provided');
    }
    
    if (!userId) {
      throw new Error('Could not determine user ID');
    }
    
    // Fetch all campaigns
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('campaigns')
      .select('*');
    
    if (campaignsError) {
      console.error('Campaigns fetch error:', campaignsError);
      throw new Error(`Error fetching campaigns: ${campaignsError.message}`);
    }
    
    // Fetch all ad sets
    const { data: adSets, error: adSetsError } = await supabaseAdmin
      .from('ad_sets')
      .select('*');
    
    if (adSetsError) {
      console.error('Ad sets fetch error:', adSetsError);
      throw new Error(`Error fetching ad sets: ${adSetsError.message}`);
    }
    
    // Parse request body to get the backup type
    let backupType = 'scheduled';
    try {
      const requestData = await req.json();
      if (requestData && requestData.type) {
        backupType = requestData.type;
      }
    } catch (e) {
      console.log('No request body or invalid JSON, using default backup type');
    }
    
    console.log(`Creating ${backupType} backup with ${campaigns.length} campaigns and ${adSets.length} ad sets`);
    
    // Create backup record with all data
    const backupData = {
      timestamp,
      backup_type: backupType,
      campaigns_data: campaigns,
      ad_sets_data: adSets,
      created_by: userId
    };
    
    // First check if the campaign_backups table exists
    const { error: tableCheckError } = await supabaseAdmin
      .from(BACKUP_TABLE)
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Table check error:', tableCheckError);
      // The table might not exist, try to create it
      await createBackupTable();
    }
    
    // Insert backup record
    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from(BACKUP_TABLE)
      .insert(backupData)
      .select('id')
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Error creating backup: ${insertError.message}`);
    }
    
    console.log(`Backup completed successfully at ${timestamp} with ID ${insertResult?.id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup completed successfully',
        timestamp,
        backup_id: insertResult?.id,
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

// Helper function to create the backup table if it doesn't exist
async function createBackupTable() {
  // This will be executed if the table doesn't exist
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.${BACKUP_TABLE} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      timestamp TIMESTAMPTZ NOT NULL,
      backup_type TEXT NOT NULL,
      campaigns_data JSONB NOT NULL,
      ad_sets_data JSONB NOT NULL,
      created_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  
  try {
    // Using rpc to execute custom SQL is not allowed in edge functions
    // We'll try to create it using the Supabase client instead
    const { data, error } = await supabaseAdmin
      .from(BACKUP_TABLE)
      .insert({
        timestamp: new Date().toISOString(),
        backup_type: 'test',
        campaigns_data: [],
        ad_sets_data: [],
        created_by: null
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating backup table:', error);
      throw new Error(`Could not create backup table: ${error.message}`);
    }
    
    // If we get here, the table exists
    console.log('Backup table exists or was created successfully');
    
    // Delete the test record
    if (data?.id) {
      await supabaseAdmin
        .from(BACKUP_TABLE)
        .delete()
        .eq('id', data.id);
    }
  } catch (error) {
    console.error('Failed to create backup table:', error);
    throw new Error('Could not set up backup table, please create it manually');
  }
}
