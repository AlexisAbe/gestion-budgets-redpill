
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, AlertCircle, Plus, Trash2, Save } from 'lucide-react';
import { useGlobalBudgetStore } from '@/store/globalBudgetStore';
import { useCampaignStore } from '@/store/campaignStore';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GlobalBudgetSettings() {
  const { 
    weeklyPercentages, 
    setWeeklyPercentages, 
    initializeDefaultPercentages,
    budgetConfigurations,
    activeConfigId,
    addConfiguration,
    deleteConfiguration,
    updateConfiguration,
    setActiveConfiguration
  } = useGlobalBudgetStore();
  
  const { weeks, campaigns, autoDistributeBudget } = useCampaignStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localPercentages, setLocalPercentages] = useState<Record<string, number>>({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [error, setError] = useState('');

  // States for simplified configuration
  const [newConfigName, setNewConfigName] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [distributionStrategy, setDistributionStrategy] = useState<'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global'>('manual');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'edit' | 'manage' | 'apply'>('edit');

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
    
    // If this is for a specific configuration, update it
    if (activeConfigId) {
      updateConfiguration(activeConfigId, {
        percentages: localPercentages
      });
    }
    
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

  // Functions for configuration management
  const handleAddConfiguration = () => {
    if (!newConfigName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour la configuration",
        variant: "destructive"
      });
      return;
    }
    
    // Check if name already exists
    const exists = Object.values(budgetConfigurations).some(
      config => config.name.toLowerCase() === newConfigName.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Erreur",
        description: "Une configuration avec ce nom existe déjà",
        variant: "destructive"
      });
      return;
    }
    
    // Create new configuration with even distribution
    const evenPercentage = Math.floor(100 / weeks.length);
    const remainder = 100 - (evenPercentage * weeks.length);
    
    const newPercentages: Record<string, number> = {};
    weeks.forEach((week, index) => {
      if (index === weeks.length - 1) {
        newPercentages[week.weekLabel] = evenPercentage + remainder;
      } else {
        newPercentages[week.weekLabel] = evenPercentage;
      }
    });
    
    addConfiguration(newConfigName, newPercentages);
    
    setNewConfigName('');
    
    toast({
      title: "Succès",
      description: `Configuration "${newConfigName}" créée avec succès`
    });
  };

  const handleDeleteConfiguration = (id: string) => {
    const configName = budgetConfigurations[id]?.name;
    deleteConfiguration(id);
    
    toast({
      title: "Succès",
      description: `Configuration "${configName}" supprimée`
    });
  };

  const handleSelectConfiguration = (id: string) => {
    setActiveConfiguration(id);
  };

  const handleToggleCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleToggleWeek = (weekLabel: string) => {
    setSelectedWeeks(prev =>
      prev.includes(weekLabel)
        ? prev.filter(week => week !== weekLabel)
        : [...prev, weekLabel]
    );
  };

  const handleApplyToSelectedCampaigns = async () => {
    if (selectedCampaigns.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une campagne",
        variant: "destructive"
      });
      return;
    }

    if (!activeConfigId && distributionStrategy === 'global') {
      toast({
        title: "Erreur",
        description: "Aucune configuration active",
        variant: "destructive"
      });
      return;
    }

    // Get the percentages from the active configuration
    const configPercentages = distributionStrategy === 'global' ? 
      (budgetConfigurations[activeConfigId]?.percentages || {}) : undefined;
    
    // Apply to each selected campaign
    for (const campaignId of selectedCampaigns) {
      try {
        await autoDistributeBudget(
          campaignId,
          distributionStrategy,
          distributionStrategy === 'manual' || distributionStrategy === 'global' ? 
            configPercentages || localPercentages : undefined
        );
      } catch (error) {
        console.error(`Error applying budget to campaign ${campaignId}:`, error);
        toast({
          title: "Erreur",
          description: `Erreur lors de l'application du budget à une campagne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          variant: "destructive"
        });
      }
    }

    toast({
      title: "Succès",
      description: `Budget appliqué à ${selectedCampaigns.length} campagne(s)`
    });
    
    setIsDialogOpen(false);
  };

  // Simplified UI components
  const CampaignSelectionStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sélectionnez les campagnes</h3>
      <ScrollArea className="h-[280px] border rounded-md p-3">
        {campaigns.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Aucune campagne disponible
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map(campaign => (
              <div 
                key={campaign.id} 
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => handleToggleCampaign(campaign.id)}
              >
                <Checkbox 
                  id={`campaign-${campaign.id}`}
                  checked={selectedCampaigns.includes(campaign.id)}
                  onCheckedChange={() => handleToggleCampaign(campaign.id)}
                />
                <Label 
                  htmlFor={`campaign-${campaign.id}`}
                  className="cursor-pointer flex-grow"
                >
                  {campaign.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const StrategySelectionStep = () => {
    const hasGlobalConfig = Object.keys(budgetConfigurations).length > 0;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Stratégie de distribution</h3>
        <Select
          value={distributionStrategy}
          onValueChange={(value: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global') => setDistributionStrategy(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisissez une stratégie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="even">Distribution égale</SelectItem>
            <SelectItem value="front-loaded">Chargée en début</SelectItem>
            <SelectItem value="back-loaded">Chargée en fin</SelectItem>
            <SelectItem value="bell-curve">Courbe en cloche</SelectItem>
            <SelectItem value="manual">Distribution manuelle (configuration)</SelectItem>
            <SelectItem value="global" disabled={!hasGlobalConfig}>Utiliser configuration globale</SelectItem>
          </SelectContent>
        </Select>
        
        {distributionStrategy === 'global' && (
          <div className="mt-2">
            <Label>Configuration à utiliser</Label>
            <Select
              value={activeConfigId || ''}
              onValueChange={(id) => id && handleSelectConfiguration(id)}
              disabled={Object.keys(budgetConfigurations).length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une configuration" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(budgetConfigurations).map(([id, config]) => (
                  <SelectItem key={id} value={id}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  const WeekSelectionStep = () => (
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
              onClick={() => handleToggleWeek(week.weekLabel)}
            >
              <Checkbox 
                id={`week-select-${week.weekLabel}`} 
                checked={selectedWeeks.includes(week.weekLabel)}
                onCheckedChange={() => handleToggleWeek(week.weekLabel)}
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

  const ManualDistributionStep = () => (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Répartition manuelle</h3>
        <Button variant="outline" size="sm" onClick={handleEvenDistribution}>
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
                  value={localPercentages[week.weekLabel] || 0}
                  onChange={(e) => handlePercentageChange(week.weekLabel, e.target.value)}
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

  const ManageConfigurationsStep = () => (
    <div className="space-y-4">
      <div className="flex items-end gap-2 mb-4">
        <div className="space-y-2 flex-1">
          <Label htmlFor="new-config-name">Nouvelle configuration</Label>
          <Input 
            id="new-config-name"
            placeholder="Nom de la configuration" 
            value={newConfigName} 
            onChange={e => setNewConfigName(e.target.value)} 
          />
        </div>
        <Button onClick={handleAddConfiguration}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </div>
      
      <div className="border rounded-md">
        <div className="bg-muted px-4 py-2 border-b">
          <h3 className="font-medium">Configurations disponibles</h3>
        </div>
        <ScrollArea className="h-[240px]">
          {Object.entries(budgetConfigurations).length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune configuration disponible
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(budgetConfigurations).map(([id, config]) => (
                <div 
                  key={id} 
                  className={`flex items-center justify-between p-3 hover:bg-accent cursor-pointer ${
                    id === activeConfigId ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleSelectConfiguration(id)}
                >
                  <span className="font-medium">{config.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfiguration(id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );

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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Répartition budgétaire</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-6">
            {/* Navigation buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={currentView === 'edit' ? 'default' : 'outline'} 
                onClick={() => setCurrentView('edit')}
              >
                Éditer les pourcentages
              </Button>
              <Button 
                variant={currentView === 'manage' ? 'default' : 'outline'} 
                onClick={() => setCurrentView('manage')}
              >
                Gérer les configurations
              </Button>
              <Button 
                variant={currentView === 'apply' ? 'default' : 'outline'} 
                onClick={() => setCurrentView('apply')}
              >
                Appliquer aux campagnes
              </Button>
            </div>

            {/* Content based on current view */}
            <ScrollArea className="h-[400px]">
              {currentView === 'edit' && <ManualDistributionStep />}
              {currentView === 'manage' && <ManageConfigurationsStep />}
              {currentView === 'apply' && (
                <div className="space-y-6">
                  <CampaignSelectionStep />
                  <StrategySelectionStep />
                  <WeekSelectionStep />
                </div>
              )}
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            {currentView === 'edit' && (
              <Button onClick={handleSave} disabled={totalPercentage !== 100}>
                Enregistrer
              </Button>
            )}
            {currentView === 'apply' && (
              <Button 
                onClick={handleApplyToSelectedCampaigns}
                disabled={selectedCampaigns.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Appliquer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
