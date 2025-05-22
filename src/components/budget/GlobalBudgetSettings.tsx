
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, AlertCircle } from 'lucide-react';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { useCampaignStore } from '@/store/campaignStore';
import { toast } from '@/hooks/use-toast';

export function GlobalBudgetSettings() {
  const { weeklyPercentages, setWeeklyPercentages, initializeDefaultPercentages } = useGlobalBudgetStore();
  const { weeks } = useCampaignStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localPercentages, setLocalPercentages] = useState<Record<string, number>>({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [error, setError] = useState('');

  // Initialize percentages if needed
  useEffect(() => {
    initializeDefaultPercentages();
  }, [initializeDefaultPercentages]);

  // When dialog opens, initialize local state with current percentages
  useEffect(() => {
    if (isDialogOpen) {
      setLocalPercentages({...weeklyPercentages});
      calculateTotal({...weeklyPercentages});
    }
  }, [isDialogOpen, weeklyPercentages]);

  const calculateTotal = (percentages: Record<string, number>) => {
    const total = Object.values(percentages).reduce((sum, val) => sum + (val || 0), 0);
    setTotalPercentage(total);
    
    if (total !== 100) {
      setError(`Le total doit être égal à 100%. Actuellement: ${total}%`);
    } else {
      setError('');
    }
  };

  const handlePercentageChange = (weekLabel: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const newPercentages = { ...localPercentages, [weekLabel]: numValue };
    setLocalPercentages(newPercentages);
    calculateTotal(newPercentages);
  };

  const handleSave = () => {
    if (totalPercentage !== 100) {
      toast({
        title: "Erreur",
        description: `Le total des pourcentages doit être égal à 100%. Actuellement: ${totalPercentage}%`,
        variant: "destructive"
      });
      return;
    }
    
    setWeeklyPercentages(localPercentages);
    toast({
      title: "Succès",
      description: "Les pourcentages globaux ont été sauvegardés"
    });
    setIsDialogOpen(false);
  };

  const handleEvenDistribution = () => {
    if (weeks.length === 0) return;
    
    const evenPercentage = Math.floor(100 / weeks.length);
    const remainder = 100 - (evenPercentage * weeks.length);
    
    const evenPercentages: Record<string, number> = {};
    weeks.forEach((week, index) => {
      if (index === weeks.length - 1) {
        evenPercentages[week.weekLabel] = evenPercentage + remainder;
      } else {
        evenPercentages[week.weekLabel] = evenPercentage;
      }
    });
    
    setLocalPercentages(evenPercentages);
    calculateTotal(evenPercentages);
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Répartition globale du budget</span>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurer
            </Button>
          </CardTitle>
          <CardDescription>
            Définissez une répartition globale des budgets par semaine que vous pourrez appliquer à toutes vos campagnes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Object.entries(weeklyPercentages).map(([weekLabel, percentage]) => (
              <div key={weekLabel} className="flex flex-col border rounded-md p-3">
                <span className="text-sm font-medium">{weekLabel}</span>
                <span className="text-lg font-bold">{percentage}%</span>
              </div>
            ))}
          </div>
          {Object.keys(weeklyPercentages).length === 0 && (
            <div className="text-muted-foreground text-center py-4">
              Aucune répartition définie. Cliquez sur Configurer pour définir la répartition globale.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configurer la répartition globale des budgets</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={handleEvenDistribution}>
                Distribution égale
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {weeks.map((week) => (
                <div key={week.weekLabel} className="flex items-center justify-between gap-4">
                  <Label htmlFor={`week-${week.weekLabel}`} className="w-20 flex-shrink-0">
                    {week.weekLabel}
                  </Label>
                  <div className="flex items-center gap-2 flex-grow">
                    <Input
                      id={`week-${week.weekLabel}`}
                      type="number"
                      min="0"
                      max="100"
                      value={localPercentages[week.weekLabel] || 0}
                      onChange={(e) => handlePercentageChange(week.weekLabel, e.target.value)}
                      className="w-full"
                    />
                    <span className="flex-shrink-0">%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span>Total:</span>
              <span className={`font-bold ${totalPercentage !== 100 ? 'text-red-500' : 'text-green-500'}`}>
                {totalPercentage}%
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={totalPercentage !== 100}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
