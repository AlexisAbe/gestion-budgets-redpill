
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { BackupRecord } from './types';

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBackup: BackupRecord | null;
  onRestore: () => void;
}

export function RestoreDialog({ open, onOpenChange, selectedBackup, onRestore }: RestoreDialogProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onRestore}>
            Restaurer les données
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
