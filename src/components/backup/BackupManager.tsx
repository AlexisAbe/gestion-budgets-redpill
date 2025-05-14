
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2 } from 'lucide-react';
import { BackupList } from './BackupList';
import { RestoreDialog } from './RestoreDialog';
import { useBackups } from './useBackups';

export function BackupManager() {
  const {
    backups,
    loading,
    creating,
    selectedBackup,
    restoreDialogOpen,
    setRestoreDialogOpen,
    createManualBackup,
    handleRestoreClick,
    restoreFromBackup
  } = useBackups();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestionnaire de sauvegardes
          </span>
          <Button 
            onClick={createManualBackup} 
            disabled={loading || creating}
            className="bg-green-500 hover:bg-green-600"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              'Créer une sauvegarde manuelle'
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          Les sauvegardes automatiques sont effectuées trois fois par jour pour assurer la sécurité de vos données.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BackupList 
          backups={backups} 
          onRestoreClick={handleRestoreClick} 
          loading={loading} 
        />
      </CardContent>

      <RestoreDialog 
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        selectedBackup={selectedBackup}
        onRestore={restoreFromBackup}
      />
    </Card>
  );
}
