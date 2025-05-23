
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeeklyView } from '@/utils/dateUtils';
import { Input } from '@/components/ui/input';

interface WeekSelectionStepProps {
  weeks: WeeklyView[];
  selectedWeeks: string[];
  onToggleWeek: (weekLabel: string) => void;
  weekPercentages?: Record<string, number>;
  onPercentageChange?: (weekLabel: string, percentage: number) => void;
  totalPercentage?: number;
}

export function WeekSelectionStep({ 
  weeks, 
  selectedWeeks, 
  onToggleWeek,
  weekPercentages = {},
  onPercentageChange,
  totalPercentage = 0
}: WeekSelectionStepProps) {
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
      
      {selectedWeeks.length > 0 && onPercentageChange && (
        <div className="space-y-4 mt-4">
          <h4 className="text-md font-medium">Répartition budgétaire (%)</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedWeeks.map(weekLabel => (
              <div key={`distribution-${weekLabel}`} className="flex flex-col space-y-1">
                <label className="text-sm">{weekLabel}</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={weekPercentages[weekLabel] || 0}
                  onChange={(e) => onPercentageChange(weekLabel, parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium">Total:</span>
            <span className={`font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
