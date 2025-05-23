
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';

interface ManageConfigurationsStepProps {
  newConfigName: string;
  onNewConfigNameChange: (value: string) => void;
  onAddConfiguration: () => void;
  budgetConfigurations: Record<string, { name: string; percentages: Record<string, number> }>;
  activeConfigId: string | null;
  onSelectConfiguration: (id: string) => void;
  onDeleteConfiguration: (id: string) => void;
}

export function ManageConfigurationsStep({
  newConfigName,
  onNewConfigNameChange,
  onAddConfiguration,
  budgetConfigurations,
  activeConfigId,
  onSelectConfiguration,
  onDeleteConfiguration
}: ManageConfigurationsStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 mb-4">
        <div className="space-y-2 flex-1">
          <Label htmlFor="new-config-name">Nouvelle configuration</Label>
          <Input 
            id="new-config-name"
            placeholder="Nom de la configuration" 
            value={newConfigName} 
            onChange={e => onNewConfigNameChange(e.target.value)} 
          />
        </div>
        <Button onClick={onAddConfiguration}>
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
                  onClick={() => onSelectConfiguration(id)}
                >
                  <span className="font-medium">{config.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConfiguration(id);
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
}
