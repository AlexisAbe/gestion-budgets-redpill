
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  // New state for configuration management
  const [newConfigName, setNewConfigName] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [distributionStrategy, setDistributionStrategy] = useState<string>('manual');
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);

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
    
    const newId = addConfiguration(newConfigName, newPercentages);
    setActiveConfiguration(newId);
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

    if (!activeConfigId) {
      toast({
        title: "Erreur",
        description: "Aucune configuration active",
        variant: "destructive"
      });
      return;
    }

    // Get the percentages from the active configuration
    const configPercentages = budgetConfigurations[activeConfigId]?.percentages || {};
    
    // Filter percentages to only include selected weeks if any are selected
    const percentagesToApply = selectedWeeks.length > 0 
      ? Object.entries(configPercentages)
          .filter(([week]) => selectedWeeks.includes(week))
          .reduce((obj, [week, value]) => ({ ...obj, [week]: value }), {} as Record<string, number>)
      : configPercentages;
    
    // Apply to each selected campaign
    for (const campaignId of selectedCampaigns) {
      try {
        await autoDistributeBudget(
          campaignId,
          distributionStrategy === 'manual' ? 'manual' : distributionStrategy,
          distributionStrategy === 'manual' ? percentagesToApply : undefined
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
            <DialogTitle>Configurer la répartition globale des budgets</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="edit" className="flex-1">Édition des pourcentages</TabsTrigger>
              <TabsTrigger value="configs" className="flex-1">Gestion des configurations</TabsTrigger>
              <TabsTrigger value="apply" className="flex-1">Appliquer aux campagnes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4">
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
              
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-4">
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
              </ScrollArea>
              
              <div className="mt-4 flex justify-between items-center">
                <span>Total:</span>
                <span className={`font-bold ${totalPercentage !== 100 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalPercentage}%
                </span>
              </div>
            </TabsContent>
            
            <TabsContent value="configs" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="apply" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Stratégie de distribution</h3>
                    <Select value={distributionStrategy} onValueChange={setDistributionStrategy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez une stratégie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="even">Distribution égale</SelectItem>
                        <SelectItem value="front-loaded">Chargée en début</SelectItem>
                        <SelectItem value="back-loaded">Chargée en fin</SelectItem>
                        <SelectItem value="bell-curve">Courbe en cloche</SelectItem>
                        <SelectItem value="manual">Distribution manuelle (configuration)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Semaines ciblées</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Sélectionnez les semaines auxquelles appliquer cette configuration (si aucune n'est sélectionnée, toutes les semaines seront concernées)
                    </p>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {weeks.map(week => (
                          <div key={week.weekLabel} className="flex items-center space-x-2">
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
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Campagnes à modifier</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Sélectionnez les campagnes auxquelles vous souhaitez appliquer cette configuration
                  </p>
                  <ScrollArea className="h-[260px] border rounded-md p-2">
                    {campaigns.length === 0 ? (
                      <div className="text-center text-muted-foreground p-4">
                        Aucune campagne disponible
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {campaigns.map(campaign => (
                          <div key={campaign.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`campaign-${campaign.id}`}
                              checked={selectedCampaigns.includes(campaign.id)}
                              onCheckedChange={() => handleToggleCampaign(campaign.id)}
                            />
                            <label 
                              htmlFor={`campaign-${campaign.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {campaign.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleApplyToSelectedCampaigns} 
                  disabled={selectedCampaigns.length === 0 || !activeConfigId}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Appliquer aux campagnes sélectionnées
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            {activeTab === "edit" && (
              <Button onClick={handleSave} disabled={totalPercentage !== 100}>
                Enregistrer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
