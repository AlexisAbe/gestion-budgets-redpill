
import React from 'react';
import { WeeklyView } from '@/types/campaign';

interface EmptyAdSetsProps {
  campaignId: string;
  weeks: WeeklyView[];
}

export function EmptyAdSets({ campaignId, weeks }: EmptyAdSetsProps) {
  return (
    <tr>
      <td colSpan={8} className="bg-muted/5 p-2 text-center">
        <div className="text-sm text-muted-foreground py-2">
          Pas de sous-ensembles pour cette campagne
        </div>
      </td>
      {weeks.map(week => (
        <td key={`empty-${campaignId}-${week.weekLabel}`} className="bg-muted/5"></td>
      ))}
    </tr>
  );
}
