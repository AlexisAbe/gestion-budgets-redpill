
import React, { useState } from 'react';
import { AdSet } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budgetUtils';

interface AdSetFormProps {
  campaignId: string;
  campaignBudget: number;
  onSave: (adSets: Array<Omit<AdSet, "id" | "createdAt" | "updatedAt">>) => void;
  existingAdSets?: AdSet[];
}

export function AdSetForm({ campaignId, campaignBudget, onSave, existingAdSets = [] }: AdSetFormProps) {
  const [adSets, setAdSets] = useState<Array<Omit<AdSet, "id" | "createdAt" | "updatedAt">>>(
    existingAdSets.map(adSet => ({
      campaignId: adSet.campaignId,
      name: adSet.name,
      budgetPercentage: adSet.budgetPercentage,
      description: adSet.description,
      targetAudience: adSet.targetAudience
    }))
  );

  const [tempAdSet, setTempAdSet] = useState<Omit<AdSet, "id" | "createdAt" | "updatedAt">>({
    campaignId,
    name: '',
    budgetPercentage: 0,
    description: '',
    targetAudience: ''
  });

  const getTotalPercentage = () => {
    return adSets.reduce((sum, adSet) => sum + adSet.budgetPercentage, 0);
  };

  const getRemainingPercentage = () => {
    return 100 - getTotalPercentage();
  };

  const handleAddAdSet = () => {
    if (!tempAdSet.name) {
      toast({
        title: "Erreur",
        description: "Le nom du sous-ensemble est requis",
        variant: "destructive"
      });
      return;
    }

    if (tempAdSet.budgetPercentage <= 0 || tempAdSet.budgetPercentage > getRemainingPercentage()) {
      toast({
        title: "Erreur",
        description: `Le pourcentage du budget doit être entre 1 et ${getRemainingPercentage()}%`,
        variant: "destructive"
      });
      return;
    }

    setAdSets([...adSets, { ...tempAdSet }]);

    // Reset form
    setTempAdSet({
      campaignId,
      name: '',
      budgetPercentage: 0,
      description: '',
      targetAudience: ''
    });

    // Save changes
    onSave([...adSets, { ...tempAdSet }]);
  };

  const handleRemoveAdSet = (index: number) => {
    const newAdSets = [...adSets];
    newAdSets.splice(index, 1);
    setAdSets(newAdSets);
    onSave(newAdSets);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Sous-ensembles de publicité</h3>
        <span className={getRemainingPercentage() < 0 ? "text-destructive" : ""}>
          Budget alloué: {getTotalPercentage()}% / 100%
        </span>
      </div>

      {getRemainingPercentage() < 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le total des pourcentages dépasse 100%. Veuillez ajuster les pourcentages.
          </AlertDescription>
        </Alert>
      )}

      {getTotalPercentage() === 100 && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            100% du budget a été alloué aux sous-ensembles.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {adSets.map((adSet, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{adSet.name}</h4>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {adSet.budgetPercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({formatCurrency(campaignBudget * (adSet.budgetPercentage / 100))})
                  </span>
                </div>
                {adSet.targetAudience && (
                  <p className="text-sm"><span className="font-medium">Cible:</span> {adSet.targetAudience}</p>
                )}
                {adSet.description && (
                  <p className="text-sm"><span className="font-medium">Description:</span> {adSet.description}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveAdSet(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">Ajouter un nouveau sous-ensemble</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input 
              id="name"
              value={tempAdSet.name}
              onChange={(e) => setTempAdSet({ ...tempAdSet, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetPercentage">Pourcentage du budget (%)</Label>
            <Input 
              id="budgetPercentage"
              type="number"
              min="1"
              max={getRemainingPercentage()}
              value={tempAdSet.budgetPercentage}
              onChange={(e) => setTempAdSet({ ...tempAdSet, budgetPercentage: Number(e.target.value) })}
            />
            {tempAdSet.budgetPercentage > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(campaignBudget * (tempAdSet.budgetPercentage / 100))}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Audience cible</Label>
          <Input 
            id="targetAudience"
            placeholder="Ex: Hommes 25-34 ans, intéressés par le sport"
            value={tempAdSet.targetAudience || ''}
            onChange={(e) => setTempAdSet({ ...tempAdSet, targetAudience: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            placeholder="Décrivez ce sous-ensemble de publicité..."
            value={tempAdSet.description || ''}
            onChange={(e) => setTempAdSet({ ...tempAdSet, description: e.target.value })}
            rows={2}
          />
        </div>
        <Button 
          onClick={handleAddAdSet}
          disabled={!tempAdSet.name || tempAdSet.budgetPercentage <= 0 || tempAdSet.budgetPercentage > getRemainingPercentage()}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter ce sous-ensemble
        </Button>
      </div>
    </div>
  );
}
