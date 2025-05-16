
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeeklyView } from '@/types/campaign';

interface CampaignWeekSelectorProps {
  weeks: WeeklyView[];
  selectedWeekLabel: string | null;
  onWeekChange: (value: string) => void;
}

export function CampaignWeekSelector({ 
  weeks, 
  selectedWeekLabel, 
  onWeekChange 
}: CampaignWeekSelectorProps) {
  return (
    <Select
      value={selectedWeekLabel || ''}
      onValueChange={onWeekChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sélectionner une semaine" />
      </SelectTrigger>
      <SelectContent>
        {weeks.map((week) => (
          <SelectItem key={week.weekLabel} value={week.weekLabel}>
            {week.weekLabel} ({new Date(week.startDate).toLocaleDateString('fr-FR')})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
