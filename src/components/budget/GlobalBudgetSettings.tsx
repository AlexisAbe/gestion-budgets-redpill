
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { BudgetConfigDialog } from './BudgetConfigDialog';

export function GlobalBudgetSettings() {
  const { 
    weeklyPercentages, 
    activeConfigId, 
    budgetConfigurations 
  } = useGlobalBudgetStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Configuration actuelle</h3>
              <div className="text-sm text-muted-foreground">
                {activeConfigId 
                  ? budgetConfigurations[activeConfigId]?.name || "Configuration active" 
                  : "Aucune configuration sélectionnée"}
              </div>
            </div>
            
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
          </div>
        </CardContent>
      </Card>

      <BudgetConfigDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
}
