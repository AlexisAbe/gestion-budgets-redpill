
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, Calendar } from 'lucide-react';
import { BackupRecord } from './types';

interface BackupItemProps {
  backup: BackupRecord;
  onRestoreClick: (backup: BackupRecord) => void;
}

export function BackupItem({ backup, onRestoreClick }: BackupItemProps) {
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
    <Card className="p-4 hover:bg-muted/30 transition-colors">
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
          onClick={() => onRestoreClick(backup)}
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
  );
}
