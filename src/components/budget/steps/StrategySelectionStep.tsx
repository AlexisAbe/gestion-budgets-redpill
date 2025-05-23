
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StrategySelectionStepProps {
  distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global';
  onStrategyChange: (value: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual' | 'global') => void;
  activeConfigId: string | null;
  budgetConfigurations: Record<string, { name: string; percentages: Record<string, number> }>;
  onSelectConfiguration: (id: string) => void;
}

export function StrategySelectionStep({ 
  distributionStrategy, 
  onStrategyChange, 
  activeConfigId, 
  budgetConfigurations,
  onSelectConfiguration
}: StrategySelectionStepProps) {
  const hasGlobalConfig = Object.keys(budgetConfigurations).length > 0;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Stratégie de distribution</h3>
      <Select
        value={distributionStrategy}
        onValueChange={(value: any) => onStrategyChange(value)}
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
            onValueChange={(id) => id && onSelectConfiguration(id)}
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
}
