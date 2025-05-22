
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Campaign, WeeklyView } from '@/types/campaign';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';

interface BudgetDistributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  weeks: WeeklyView[];
  onDistribute: (
    campaignId: string,
    distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global',
    percentages?: Record<string, number>
  ) => Promise<void>;
}

export function BudgetDistributionModal({
  open,
  onOpenChange,
  campaign,
  weeks,
  onDistribute,
}: BudgetDistributionModalProps) {
  const { weeklyPercentages, isInitialized } = useGlobalBudgetStore();
  const [selectedDistribution, setSelectedDistribution] = useState<'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global'>('even');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [totalPercentage, setTotalPercentage] = useState(0);

  // Initialize percentages based on campaign's week range
  useEffect(() => {
    if (open) {
      // Filter weeks relevant to this campaign
      const relevantWeeks = getRelevantWeeks();
      const weekCount = relevantWeeks.length;
      
      if (weekCount === 0) return;
      
      // Initialize with even distribution
      const evenPercentage = Math.floor(100 / weekCount);
      const remainder = 100 - (evenPercentage * weekCount);
      
      const newPercentages: Record<string, number> = {};
      relevantWeeks.forEach((week, index) => {
        if (index === weekCount - 1) {
          // Last week gets the remainder
          newPercentages[week.weekLabel] = evenPercentage + remainder;
        } else {
          newPercentages[week.weekLabel] = evenPercentage;
        }
      });
      
      setPercentages(newPercentages);
      setTotalPercentage(100);
    }
  }, [open, campaign, weeks]);

  // Get only the weeks relevant to this campaign
  const getRelevantWeeks = () => {
    // This is a simplified version - in a real app, you'd filter weeks based on the campaign's start and end date
    return weeks;
  };

  const handlePercentageChange = (weekLabel: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const newPercentages = { ...percentages, [weekLabel]: numValue };
    setPercentages(newPercentages);
    
    // Calculate total percentage
    const total = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
    setTotalPercentage(total);
  };

  const handleDistribute = async () => {
    if (totalPercentage !== 100 && selectedDistribution === 'manual') {
      return; // Don't proceed if percentages don't add up to 100%
    }
    
    setIsSubmitting(true);
    
    try {
      // Use global percentages if that distribution is selected
      if (selectedDistribution === 'global') {
        await onDistribute(campaign.id, 'global');
      } else if (selectedDistribution === 'manual') {
        await onDistribute(campaign.id, 'manual', percentages);
      } else {
        await onDistribute(campaign.id, selectedDistribution);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error distributing budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasGlobalPercentages = isInitialized && Object.keys(weeklyPercentages).length > 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !isSubmitting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Distribuer le budget ({campaign.name})</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="automatic" className="mt-4">
          <TabsList className="mb-4">
            <TabsTrigger value="automatic">Distribution automatique</TabsTrigger>
            <TabsTrigger value="manual">Distribution manuelle</TabsTrigger>
          </TabsList>
          
          <TabsContent value="automatic">
            <div className="space-y-4">
              <RadioGroup 
                value={selectedDistribution}
                onValueChange={(value) => setSelectedDistribution(value as any)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="even" id="even" />
                  <Label htmlFor="even">Distribution égale (même montant chaque semaine)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="front-loaded" id="front-loaded" />
                  <Label htmlFor="front-loaded">Début chargé (budget plus élevé au début)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="back-loaded" id="back-loaded" />
                  <Label htmlFor="back-loaded">Fin chargée (budget plus élevé à la fin)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bell-curve" id="bell-curve" />
                  <Label htmlFor="bell-curve">Courbe en cloche (budget plus élevé au milieu)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="global" id="global" disabled={!hasGlobalPercentages} />
                  <Label htmlFor="global" className={!hasGlobalPercentages ? "text-muted-foreground" : ""}>
                    Utiliser la répartition globale
                  </Label>
                </div>
              </RadioGroup>
              
              {selectedDistribution === 'global' && hasGlobalPercentages && (
                <div className="mt-4 bg-muted p-3 rounded-md">
                  <p className="text-sm mb-2 font-medium">Répartition globale actuelle:</p>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    {Object.entries(weeklyPercentages).map(([week, percent]) => (
                      <div key={week} className="flex justify-between">
                        <span>{week}:</span>
                        <span>{percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDistribution === 'global' && !hasGlobalPercentages && (
                <p className="text-sm text-muted-foreground mt-2">
                  Aucune répartition globale n'est définie. Vous pouvez en définir une dans les paramètres.
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manual">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Définissez manuellement le pourcentage du budget total à attribuer à chaque semaine.
              </p>
              
              <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                {getRelevantWeeks().map((week) => (
                  <div key={week.weekLabel} className="flex items-center justify-between gap-3">
                    <Label htmlFor={`week-${week.weekLabel}`} className="w-20">
                      {week.weekLabel}:
                    </Label>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        id={`week-${week.weekLabel}`}
                        type="number"
                        min="0"
                        max="100"
                        value={percentages[week.weekLabel] || 0}
                        onChange={(e) => handlePercentageChange(week.weekLabel, e.target.value)}
                      />
                      <span>%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between">
                <span>Total:</span>
                <span className={`font-bold ${totalPercentage !== 100 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalPercentage}%
                </span>
              </div>
              
              {totalPercentage !== 100 && (
                <p className="text-sm text-red-500 mt-2">
                  Le total doit être égal à 100% pour continuer.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleDistribute} 
            disabled={isSubmitting || (selectedDistribution === 'manual' && totalPercentage !== 100)}
          >
            {isSubmitting ? 'Distribution...' : 'Distribuer le budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
