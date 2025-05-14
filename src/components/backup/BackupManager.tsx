
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useCampaignStore } from '@/store/campaignStore';
import { AlertCircle, CheckCircle, Calendar, Clock, Database } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

// Define the backup record type to match what's in the database
type BackupRecord = {
  id: string;
  timestamp: string;
  backup_type: string;
  campaigns_data: any[];
  ad_sets_data: any[];
  created_at: string;
}

export function BackupManager() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const resetStore = useCampaignStore(state => state.resetStore);
  const fetchCampaigns = useCampaignStore(state => state.fetchCampaigns);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      // Use the raw REST API approach to avoid TypeScript limitations with RPC calls
      const { data, error } = await supabase
        .rpc('get_campaign_backups', {}) // Empty object for parameters to avoid type errors
        .limit(50); // Limit to the last 50 backups
        
      if (error) throw error;
      if (data) setBackups(data as unknown as BackupRecord[]);
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

  const restoreFromBackup = async () => {
    if (!selectedBackup) return;
    
    toast.loading('Restoring data from backup...');
    try {
      // Clear existing store data
      resetStore();
      
      // Restore campaigns first
      for (const campaignData of selectedBackup.campaigns_data) {
        const { error: campaignError } = await supabase
          .from('campaigns')
          .upsert(campaignData, { onConflict: 'id' });
          
        if (campaignError) {
          throw campaignError;
        }
      }
      
      // Then restore ad sets
      for (const adSetData of selectedBackup.ad_sets_data) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestionnaire de sauvegardes
          </span>
          <Button onClick={createManualBackup} disabled={loading}>
            Créer une sauvegarde manuelle
          </Button>
        </CardTitle>
        <CardDescription>
          Les sauvegardes automatiques sont effectuées trois fois par jour pour assurer la sécurité de vos données.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune sauvegarde disponible
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {backups.map((backup) => (
                <Card key={backup.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-primary/10 text-primary rounded-full p-1">
                        {backup.backup_type === 'scheduled' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {backup.backup_type === 'scheduled' ? 'Sauvegarde automatique' : 'Sauvegarde manuelle'}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(backup.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleRestoreClick(backup)}
                    >
                      Restaurer
                    </Button>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Campagnes: {backup.campaigns_data.length}</span>
                      <span>Ad Sets: {backup.ad_sets_data.length}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Confirmation de restauration
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de restaurer les données à partir de la sauvegarde du{' '}
              {selectedBackup ? formatDate(selectedBackup.timestamp) : ''}. Cette action remplacera toutes les données actuelles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={restoreFromBackup}>
              Restaurer les données
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
