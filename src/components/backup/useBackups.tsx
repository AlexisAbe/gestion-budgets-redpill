
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BackupRecord } from './types';
import { useCampaignStore } from '@/store/campaignStore';
import { useClientStore } from '@/store/clientStore';

export function useBackups() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const resetStore = useCampaignStore(state => state.resetStore);
  const fetchCampaigns = useCampaignStore(state => state.fetchCampaigns);
  const selectedClientId = useClientStore(state => state.selectedClientId);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || '';
      
      const response = await fetch(`https://wmclujwtwuzscfqbzfxf.supabase.co/rest/v1/rpc/get_campaign_backups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtY2x1and0d3V6c2NmcWJ6ZnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMjc0NTYsImV4cCI6MjA2MjcwMzQ1Nn0.x7ZXita8X6zfYNbEc29Hd3ZhSxXRaqBlqUyduedUK7c'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }
      
      const data = await response.json();
      setBackups(data as BackupRecord[]);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const createManualBackup = async () => {
    toast.loading('Creating backup...');
    try {
      const response = await fetch('https://wmclujwtwuzscfqbzfxf.supabase.co/functions/v1/backup-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
        },
        body: JSON.stringify({ type: 'manual' })
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      toast.success('Backup created successfully');
      await loadBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    }
  };

  const handleRestoreClick = (backup: BackupRecord) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const restoreFromBackup = async (restoreForCurrentClientOnly: boolean = false) => {
    if (!selectedBackup) return;
    
    toast.loading('Restoring data from backup...');
    try {
      // Clear existing store data
      resetStore();
      
      // Filter campaigns if restoring for current client only
      const campaignsToRestore = restoreForCurrentClientOnly && selectedClientId
        ? selectedBackup.campaigns_data.filter(campaign => campaign.client_id === selectedClientId)
        : selectedBackup.campaigns_data;
        
      // Filter ad sets for the selected campaigns if restoring for current client only
      const campaignIds = campaignsToRestore.map(c => c.id);
      const adSetsToRestore = restoreForCurrentClientOnly && selectedClientId
        ? selectedBackup.ad_sets_data.filter(adSet => campaignIds.includes(adSet.campaign_id))
        : selectedBackup.ad_sets_data;
      
      // Restore campaigns first
      for (const campaignData of campaignsToRestore) {
        const { error: campaignError } = await supabase
          .from('campaigns')
          .upsert(campaignData, { onConflict: 'id' });
          
        if (campaignError) {
          throw campaignError;
        }
      }
      
      // Then restore ad sets
      for (const adSetData of adSetsToRestore) {
        const { error: adSetError } = await supabase
          .from('ad_sets')
          .upsert(adSetData, { onConflict: 'id' });
          
        if (adSetError) {
          throw adSetError;
        }
      }
      
      // Refresh campaign data
      await fetchCampaigns();
      
      toast.success('Data restored successfully');
      setRestoreDialogOpen(false);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      toast.error('Failed to restore data');
    }
  };

  return {
    backups,
    loading,
    selectedBackup,
    restoreDialogOpen,
    setRestoreDialogOpen,
    loadBackups,
    createManualBackup,
    handleRestoreClick,
    restoreFromBackup
  };
}
