
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCampaignStore } from '@/store/campaignStore';

export interface GlobalPercentageData {
  weeks: Array<{ weekLabel: string; percentage: number }>;
  lastUpdated: string;
}

export function GlobalPercentageSettings() {
  const { weeks, saveGlobalPercentages, globalPercentages } = useCampaignStore();
  const { toast } = useToast();
  
  // Filter to show only a reasonable number of weeks (e.g., next 8 weeks)
  const visibleWeeks = weeks.slice(0, 8);
  
  const [weekPercentages, setWeekPercentages] = useState<Array<{ weekLabel: string; percentage: number }>>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);

  // Initialize with existing global percentages or equal distribution
  useEffect(() => {
    if (globalPercentages && globalPercentages.weeks.length > 0) {
      setWeekPercentages(globalPercentages.weeks);
      
      const total = globalPercentages.weeks.reduce((sum, week) => sum + week.percentage, 0);
      setTotalPercentage(total);
    } else {
      // Initialize with equal distribution
      const initialPercentage = visibleWeeks.length > 0 ? Math.floor(100 / visibleWeeks.length) : 0;
      const remainder = 100 - (initialPercentage * visibleWeeks.length);
      
      const initialWeekPercentages = visibleWeeks.map((week, index) => ({
        weekLabel: week.weekLabel,
        // Add the remainder to the first week to ensure exactly 100%
        percentage: index === 0 ? initialPercentage + remainder : initialPercentage
      }));
      
      setWeekPercentages(initialWeekPercentages);
      setTotalPercentage(100);
    }
  }, [weeks, globalPercentages]);

  const handlePercentageChange = (weekLabel: string, value: number) => {
    const newPercentages = weekPercentages.map(week => 
      week.weekLabel === weekLabel 
        ? { ...week, percentage: value } 
        : week
    );
    
    setWeekPercentages(newPercentages);
    
    // Update the total percentage
    const newTotal = newPercentages.reduce((sum, week) => sum + week.percentage, 0);
    setTotalPercentage(newTotal);
  };

  const handleSavePercentages = () => {
    if (Math.abs(totalPercentage - 100) > 0.1) {
      toast({
        title: "Erreur",
        description: `Le total doit être de 100% (actuellement ${totalPercentage}%)`,
        variant: "destructive"
      });
      return;
    }

    saveGlobalPercentages({
      weeks: weekPercentages,
      lastUpdated: new Date().toISOString()
    });
    
    toast({
      title: "Succès",
      description: "Les pourcentages globaux ont été enregistrés"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Répartition Globale des Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Définissez les pourcentages de répartition de budget par semaine qui pourront être appliqués à toutes les campagnes.
          </p>

          <div className="flex justify-between text-sm font-medium mb-2">
            <span>Semaine</span>
            <span>Pourcentage {totalPercentage !== 100 && 
              <span className={totalPercentage > 100 ? "text-red-500" : "text-amber-500"}>
                ({totalPercentage}%)
              </span>}
            </span>
          </div>
          
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            {weekPercentages.map((week) => (
              <div key={week.weekLabel} className="flex items-center justify-between">
                <Label htmlFor={`week-${week.weekLabel}`} className="w-16">{week.weekLabel}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`week-${week.weekLabel}`}
                    type="number"
                    min="0"
                    max="100"
                    className="w-20"
                    value={week.percentage}
                    onChange={(e) => handlePercentageChange(week.weekLabel, Number(e.target.value))}
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            ))}
          </div>
          
          {totalPercentage !== 100 && (
            <p className={`text-sm ${totalPercentage > 100 ? "text-red-500" : "text-amber-500"}`}>
              {totalPercentage > 100 
                ? `Le total est supérieur à 100% (${totalPercentage}%)`
                : `Le total est inférieur à 100% (${totalPercentage}%)`
              }
            </p>
          )}
          
          {totalPercentage === 100 && (
            <p className="text-sm text-green-500">
              Le total est bien de 100%
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSavePercentages}
          disabled={Math.abs(totalPercentage - 100) > 0.1}
        >
          Enregistrer les pourcentages globaux
        </Button>
      </CardFooter>
    </Card>
  );
}
