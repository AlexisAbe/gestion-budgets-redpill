
import React from 'react';
import { WeeklyView } from '@/types/campaign';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WeekSelectorProps {
  weeks: WeeklyView[];
  selectedWeekLabel: string | null;
  onSelect: (weekLabel: string) => void;
}

export function WeekSelector({ weeks, selectedWeekLabel, onSelect }: WeekSelectorProps) {
  return (
    <Select
      value={selectedWeekLabel || ''}
      onValueChange={onSelect}
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
