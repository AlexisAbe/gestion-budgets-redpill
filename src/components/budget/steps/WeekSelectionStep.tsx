
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeeklyView } from '@/utils/dateUtils';

interface WeekSelectionStepProps {
  weeks: WeeklyView[];
  selectedWeeks: string[];
  onToggleWeek: (weekLabel: string) => void;
}

export function WeekSelectionStep({ weeks, selectedWeeks, onToggleWeek }: WeekSelectionStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Semaines ciblées (optionnel)</h3>
      <p className="text-sm text-muted-foreground">
        Si vous ne sélectionnez aucune semaine, toutes les semaines seront concernées.
      </p>
      <ScrollArea className="h-[200px] border rounded-md p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {weeks.map(week => (
            <div 
              key={week.weekLabel} 
              className="flex items-center space-x-2 p-1 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => onToggleWeek(week.weekLabel)}
            >
              <Checkbox 
                id={`week-select-${week.weekLabel}`} 
                checked={selectedWeeks.includes(week.weekLabel)}
                onCheckedChange={() => onToggleWeek(week.weekLabel)}
              />
              <label 
                htmlFor={`week-select-${week.weekLabel}`}
                className="text-sm cursor-pointer"
              >
                {week.weekLabel}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
