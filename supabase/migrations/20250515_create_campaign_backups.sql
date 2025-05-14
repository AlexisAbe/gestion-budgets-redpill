
-- Create campaign backups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campaign_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  backup_type TEXT NOT NULL,
  campaigns_data JSONB NOT NULL,
  ad_sets_data JSONB NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.campaign_backups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all backups (read-only)
CREATE POLICY "Users can view all backups"
  ON public.campaign_backups
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow service role to create backups
CREATE POLICY "Only service role can create backups"
  ON public.campaign_backups
  FOR INSERT
  TO service_role
  USING (true);
