
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BackupItem } from './BackupItem';
import { BackupRecord } from './types';

interface BackupListProps {
  backups: BackupRecord[];
  onRestoreClick: (backup: BackupRecord) => void;
  loading: boolean;
}

export function BackupList({ backups, onRestoreClick, loading }: BackupListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (backups.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune sauvegarde disponible
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {backups.map((backup) => (
          <BackupItem 
            key={backup.id} 
            backup={backup} 
            onRestoreClick={onRestoreClick} 
          />
        ))}
      </div>
    </ScrollArea>
  );
}
