
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { BackupRecord } from '../types';

export interface RestoreResult {
  id: string;
  success: boolean;
  error?: any;
}

export const restoreFromBackup = async (
  selectedBackup: BackupRecord, 
  restoreForCurrentClientOnly: boolean = false,
  selectedClientId?: string | null,
  resetStore?: () => void,
  fetchCampaigns?: () => Promise<void>
) => {
  if (!selectedBackup) {
    console.error('No backup selected for restoration');
    return { success: false, error: 'No backup selected' };
  }
  
  toast({
    title: "Restauration en cours",
    description: "Restauration des données depuis la sauvegarde..."
  });
  
  try {
    console.log(`Début de la restauration${restoreForCurrentClientOnly ? ' pour le client actuel' : ' complète'}`);
    console.log(`Backup contient ${selectedBackup.campaigns_data.length} campagnes et ${selectedBackup.ad_sets_data.length} ad sets`);
    
    // Clear existing store data
    if (resetStore) resetStore();
    
    // Filter campaigns if restoring for current client only
    const campaignsToRestore = restoreForCurrentClientOnly && selectedClientId
      ? selectedBackup.campaigns_data.filter(campaign => campaign.client_id === selectedClientId)
      : selectedBackup.campaigns_data;
    
    console.log(`Campagnes à restaurer: ${campaignsToRestore.length} (client_id filtré: ${restoreForCurrentClientOnly})`);
    console.log(`IDs des campagnes à restaurer:`, campaignsToRestore.map(c => c.id));
      
    // Filter ad sets for the selected campaigns
    const campaignIds = campaignsToRestore.map(c => c.id);
    const adSetsToRestore = selectedBackup.ad_sets_data.filter(adSet => 
      campaignIds.includes(adSet.campaign_id)
    );
    
    console.log(`Ad sets à restaurer: ${adSetsToRestore.length}`);
    
    // Restore campaigns first with detailed error handling
    const campaignResults: RestoreResult[] = [];
    for (const campaignData of campaignsToRestore) {
      console.log(`Restauration de la campagne: ${campaignData.id} - ${campaignData.name}`);
      
      const { error: campaignError } = await supabase
        .from('campaigns')
        .upsert(campaignData, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });
        
      if (campaignError) {
        console.error(`Erreur lors de la restauration de la campagne ${campaignData.id}:`, campaignError);
        campaignResults.push({ id: campaignData.id, success: false, error: campaignError });
      } else {
        campaignResults.push({ id: campaignData.id, success: true });
      }
    }
    
    console.log(`Résultats de la restauration des campagnes:`, campaignResults);
    
    // Then restore ad sets with detailed error handling
    const adSetResults: RestoreResult[] = [];
    for (const adSetData of adSetsToRestore) {
      console.log(`Restauration du ad set: ${adSetData.id} - ${adSetData.name} pour la campagne ${adSetData.campaign_id}`);
      
      const { error: adSetError } = await supabase
        .from('ad_sets')
        .upsert(adSetData, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });
        
      if (adSetError) {
        console.error(`Erreur lors de la restauration du ad set ${adSetData.id}:`, adSetError);
        adSetResults.push({ id: adSetData.id, success: false, error: adSetError });
      } else {
        adSetResults.push({ id: adSetData.id, success: true });
      }
    }
    
    console.log(`Résultats de la restauration des ad sets:`, adSetResults);
    
    // Refresh campaign data
    if (fetchCampaigns) await fetchCampaigns();
    
    // Check results and show appropriate toast
    const failedCampaigns = campaignResults.filter(r => !r.success).length;
    const failedAdSets = adSetResults.filter(r => !r.success).length;
    
    if (failedCampaigns > 0 || failedAdSets > 0) {
      toast({
        variant: "warning",
        title: "Restauration partielle",
        description: `Restauration terminée avec ${failedCampaigns} erreurs de campagnes et ${failedAdSets} erreurs d'ad sets.`
      });
    } else {
      toast({
        variant: "success",
        title: "Succès",
        description: `${campaignsToRestore.length} campagnes et ${adSetsToRestore.length} ad sets restaurés avec succès`
      });
    }
    
    return { 
      success: true, 
      campaignResults,
      adSetResults,
      stats: {
        restoredCampaigns: campaignsToRestore.length,
        restoredAdSets: adSetsToRestore.length,
        failedCampaigns,
        failedAdSets
      }
    };
  } catch (error) {
    console.error('Error restoring from backup:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: `Échec de la restauration des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
    return { success: false, error };
  }
};
