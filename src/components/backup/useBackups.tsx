
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { BackupRecord } from './types';
import { useCampaignStore } from '@/store/campaignStore';
import { useClientStore } from '@/store/clientStore';
import { useAuth } from '@/context/AuthContext';

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
      loadBackups();
    } else {
      setLoading(false);
    }
  }, [session]);

  const loadBackups = async () => {
    if (!session?.access_token) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour accéder aux sauvegardes"
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Chargement des sauvegardes avec token:", session.access_token);
      // Use RPC to call the get_campaign_backups function instead of direct table access
      const { data, error } = await supabase.rpc('get_campaign_backups');
      
      if (error) {
        throw error;
      }
      
      console.log("Sauvegardes chargées:", data);
      setBackups(data as BackupRecord[]);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec du chargement des sauvegardes"
      });
    } finally {
      setLoading(false);
    }
  };

  const createManualBackup = async () => {
    if (!session?.access_token) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer une sauvegarde"
      });
      return;
    }

    setCreating(true);
    
    try {
      toast({
        title: "Création en cours",
        description: "Création de la sauvegarde en cours...",
      });
      
      console.log("Création d'une sauvegarde manuelle avec token:", session.access_token);
      
      // Call the edge function to create a backup
      const response = await fetch('https://wmclujwtwuzscfqbzfxf.supabase.co/functions/v1/backup-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          // Do not include apikey here as it's not needed for edge functions
        },
        body: JSON.stringify({ type: 'manual' })
      });

      console.log("Réponse status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Échec de la création de sauvegarde');
        } catch (e) {
          throw new Error(`Échec de la création de sauvegarde (${response.status}): ${errorText}`);
        }
      }
      
      const responseData = await response.json();
      console.log("Réponse donnée:", responseData);
      
      toast({
        variant: "success",
        title: "Succès",
        description: "Sauvegarde créée avec succès"
      });
      
      // Reload backups after creating a new one
      await loadBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Échec de la création de sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreClick = (backup: BackupRecord) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const restoreFromBackup = async (restoreForCurrentClientOnly: boolean = false) => {
    if (!selectedBackup || !session) return;
    
    toast({
      title: "Restauration en cours",
      description: "Restauration des données depuis la sauvegarde..."
    });
    
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
      
      toast({
        variant: "success",
        title: "Succès",
        description: "Données restaurées avec succès"
      });
      setRestoreDialogOpen(false);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Échec de la restauration des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  };

  return {
    backups,
    loading,
    creating,
    selectedBackup,
    restoreDialogOpen,
    setRestoreDialogOpen,
    loadBackups,
    createManualBackup,
    handleRestoreClick,
    restoreFromBackup
  };
}
