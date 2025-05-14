
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { BackupRecord } from './types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useClientStore } from '@/store/clientStore';

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBackup: BackupRecord | null;
  onRestore: (restoreForCurrentClientOnly: boolean) => void;
}

export function RestoreDialog({ open, onOpenChange, selectedBackup, onRestore }: RestoreDialogProps) {
  const [restoreOption, setRestoreOption] = useState<'global' | 'client'>('global');
  const { selectedClientId, clients } = useClientStore();
  const currentClient = clients.find(client => client.id === selectedClientId);

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

  const handleRestore = () => {
    onRestore(restoreOption === 'client');
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
            {selectedBackup ? formatDate(selectedBackup.timestamp) : ''}. Cette action remplacera les données.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            defaultValue="global" 
            value={restoreOption} 
            onValueChange={(value) => setRestoreOption(value as 'global' | 'client')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="global" id="option-global" />
              <Label htmlFor="option-global">Restaurer toutes les campagnes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="client" id="option-client" disabled={!selectedClientId} />
              <Label htmlFor="option-client" className={!selectedClientId ? "text-muted-foreground" : ""}>
                Restaurer uniquement les campagnes du client {currentClient?.name || ''}
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleRestore}>
            Restaurer les données
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
