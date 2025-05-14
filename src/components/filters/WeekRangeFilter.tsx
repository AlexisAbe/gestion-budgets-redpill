
import React, { useState } from 'react';
import { WeeklyView } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarRange } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface WeekRangeFilterProps {
  allWeeks: WeeklyView[];
  selectedWeekRange: [number, number];
  onChange: (range: [number, number]) => void;
}

export function WeekRangeFilter({ allWeeks, selectedWeekRange, onChange }: WeekRangeFilterProps) {
  const [open, setOpen] = useState(false);
  
  const handleRangeChange = (values: number[]) => {
    onChange([values[0], values[1]] as [number, number]);
  };

  // Preset selections
  const handlePresetSelect = (preset: string) => {
    switch (preset) {
      case 'all':
        onChange([1, allWeeks.length]);
        break;
      case 'next-4':
        const currentWeek = new Date().getTime();
        let nextWeekIndex = 1;
        
        // Find current week or next available
        for (let i = 0; i < allWeeks.length; i++) {
          const weekStartDate = new Date(allWeeks[i].startDate).getTime();
          if (weekStartDate >= currentWeek) {
            nextWeekIndex = i + 1;
            break;
          }
        }
        
        onChange([
          nextWeekIndex, 
          Math.min(nextWeekIndex + 3, allWeeks.length)
        ]);
        break;
      case 'next-12':
        const now = new Date().getTime();
        let currentWeekIdx = 1;
        
        // Find current week
        for (let i = 0; i < allWeeks.length; i++) {
          const weekStartDate = new Date(allWeeks[i].startDate).getTime();
          if (weekStartDate >= now) {
            currentWeekIdx = i + 1;
            break;
          }
        }
        
        onChange([
          currentWeekIdx, 
          Math.min(currentWeekIdx + 11, allWeeks.length)
        ]);
        break;
      case 'current-quarter':
        const currentMonth = new Date().getMonth();
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        const startWeek = quarterStart * 4 + 1; // Approximate
        const endWeek = startWeek + 12; // 13 weeks in a quarter
        
        onChange([
          Math.max(1, startWeek), 
          Math.min(endWeek, allWeeks.length)
        ]);
        break;
    }
  };

  // Calculate display information
  const startWeek = allWeeks[selectedWeekRange[0] - 1];
  const endWeek = allWeeks[selectedWeekRange[1] - 1];
  
  const visibleWeeksCount = selectedWeekRange[1] - selectedWeekRange[0] + 1;
  const totalWeeksCount = allWeeks.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarRange className="h-4 w-4" />
          <span>
            {`S${selectedWeekRange[0]}-S${selectedWeekRange[1]}`}
            <span className="ml-1 text-muted-foreground text-xs">
              ({visibleWeeksCount}/{totalWeeksCount})
            </span>
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium">Sélectionnez la plage de semaines</div>
            
            <div className="text-xs text-muted-foreground">
              {startWeek && endWeek && (
                `${formatDate(startWeek.startDate)} - ${formatDate(endWeek.endDate)}`
              )}
            </div>
          </div>
          
          <Slider
            defaultValue={[selectedWeekRange[0], selectedWeekRange[1]]}
            min={1}
            max={allWeeks.length}
            step={1}
            value={[selectedWeekRange[0], selectedWeekRange[1]]}
            onValueChange={handleRangeChange}
            className="py-4"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <div>Semaine {selectedWeekRange[0]}</div>
            <div>Semaine {selectedWeekRange[1]}</div>
          </div>
          
          <Select onValueChange={handlePresetSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une période prédéfinie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les semaines</SelectItem>
              <SelectItem value="next-4">4 prochaines semaines</SelectItem>
              <SelectItem value="next-12">12 prochaines semaines</SelectItem>
              <SelectItem value="current-quarter">Trimestre en cours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
