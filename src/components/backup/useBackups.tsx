
import { useState, useEffect } from 'react';
import { BackupRecord } from './types';
import { useCampaignStore } from '@/store/campaignStore';
import { useClientStore } from '@/store/clientStore';
import { useAuth } from '@/context/AuthContext';
import { loadBackups, createManualBackup } from './utils/backupOperations';
import { restoreFromBackup } from './utils/restoreOperations';

export function useBackups() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const resetStore = useCampaignStore(state => state.resetStore);
  const fetchCampaigns = useCampaignStore(state => state.fetchCampaigns);
  const selectedClientId = useClientStore(state => state.selectedClientId);
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      handleLoadBackups();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleLoadBackups = async () => {
    setLoading(true);
    const { data, error } = await loadBackups(session);
    if (!error) {
      setBackups(data);
    }
    setLoading(false);
  };

  const handleCreateManualBackup = async () => {
    setCreating(true);
    const { success } = await createManualBackup(session);
    if (success) {
      // Reload backups after creating a new one
      await handleLoadBackups();
    }
    setCreating(false);
  };

  const handleRestoreClick = (backup: BackupRecord) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const handleRestoreFromBackup = async (restoreForCurrentClientOnly: boolean = false) => {
    if (!selectedBackup) return;
    
    const result = await restoreFromBackup(
      selectedBackup,
      restoreForCurrentClientOnly,
      selectedClientId,
      resetStore,
      fetchCampaigns
    );
    
    if (result.success) {
      setRestoreDialogOpen(false);
    }
  };

  return {
    backups,
    loading,
    creating,
    selectedBackup,
    restoreDialogOpen,
    setRestoreDialogOpen,
    loadBackups: handleLoadBackups,
    createManualBackup: handleCreateManualBackup,
    handleRestoreClick,
    restoreFromBackup: handleRestoreFromBackup
  };
}
