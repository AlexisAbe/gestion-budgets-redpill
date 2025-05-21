
import React from 'react';
import { Loader2 } from 'lucide-react';
import { WeeklyView } from '@/types/campaign';

interface LoadingAdSetsProps {
  campaignId: string;
  weeks: WeeklyView[];
}

export function LoadingAdSets({ campaignId, weeks }: LoadingAdSetsProps) {
  return (
    <tr>
      <td colSpan={8} className="bg-muted/5 p-2 text-center">
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Chargement des sous-ensembles...</span>
        </div>
      </td>
      {weeks.map(week => (
        <td key={`loading-${campaignId}-${week.weekLabel}`} className="bg-muted/5"></td>
      ))}
    </tr>
  );
}
