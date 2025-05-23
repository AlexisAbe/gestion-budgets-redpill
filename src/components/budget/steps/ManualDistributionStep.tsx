import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { WeeklyView } from '@/utils/dateUtils'; // Import WeeklyView type

interface ManualDistributionStepProps {
  weeks: WeeklyView[]; // Changed from Week[] to WeeklyView[]
  percentages: Record<string, number>;
  onPercentageChange: (weekLabel: string, value: string) => void;
  onEvenDistribution: () => void;
  totalPercentage: number;
  error: string;
}

export function ManualDistributionStep({ 
  weeks, 
  percentages, 
  onPercentageChange,
  onEvenDistribution,
  totalPercentage,
  error
}: ManualDistributionStepProps) {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Répartition manuelle</h3>
        <Button variant="outline" size="sm" onClick={onEvenDistribution}>
          Distribution égale
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="grid grid-cols-2 gap-4">
          {weeks.map((week) => (
            <div key={week.weekLabel} className="flex items-center justify-between gap-2">
              <Label htmlFor={`week-${week.weekLabel}`} className="w-20 flex-shrink-0">
                {week.weekLabel}
              </Label>
              <div className="flex items-center gap-2 flex-grow">
                <Input
                  id={`week-${week.weekLabel}`}
                  type="number"
                  min="0"
                  max="100"
                  value={percentages[week.weekLabel] || 0}
                  onChange={(e) => onPercentageChange(week.weekLabel, e.target.value)}
                  className="w-full"
                />
                <span className="flex-shrink-0">%</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="mt-4 flex justify-between items-center">
        <span>Total:</span>
        <span className={`font-bold ${totalPercentage !== 100 ? 'text-red-500' : 'text-green-500'}`}>
          {totalPercentage}%
        </span>
      </div>
    </div>
  );
}
