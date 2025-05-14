
-- Create a stored procedure to get campaign backups
CREATE OR REPLACE FUNCTION public.get_campaign_backups()
RETURNS SETOF public.campaign_backups
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT * FROM public.campaign_backups
    ORDER BY timestamp DESC;
$$;
