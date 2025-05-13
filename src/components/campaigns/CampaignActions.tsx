
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, BarChart3, Filter, Minimize2, PanelLeftOpen, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CampaignActionsProps {
  campaignId: string;
  campaignName: string;
  showChart: boolean;
  showInlineAdSets: boolean;
  onToggleChart: (campaignId: string) => void;
  onToggleInlineAdSets: (campaignId: string) => void;
  onDeleteCampaign: (id: string) => void;
  onOpenDistribution: () => void;
  onOpenAdSetManager: () => void;
  onToggleAdSets: () => void;
  showAdSets: boolean;
}

export function CampaignActions({
  campaignId,
  campaignName,
  showChart,
  showInlineAdSets,
  onToggleChart,
  onToggleInlineAdSets,
  onDeleteCampaign,
  onOpenDistribution,
  onOpenAdSetManager,
  onToggleAdSets,
  showAdSets
}: CampaignActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onToggleChart(campaignId)}
        title={showChart ? "Hide chart" : "Show chart"}
      >
        {showChart ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <BarChart3 className="h-4 w-4" />
        )}
      </Button>

      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onToggleInlineAdSets(campaignId)}
        title={showInlineAdSets ? "Hide ad sets" : "Show ad sets inline"}
        className={showInlineAdSets ? "bg-primary/10" : ""}
      >
        <Filter className="h-4 w-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onOpenDistribution}>
            <PanelLeftOpen className="mr-2 h-4 w-4" />
            Distribute Budget
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenAdSetManager}>
            <Filter className="mr-2 h-4 w-4" />
            Gérer les sous-ensembles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleAdSets}>
            <Filter className="mr-2 h-4 w-4" />
            {showAdSets ? "Masquer les sous-ensembles" : "Afficher les sous-ensembles"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => {
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaignName}" ?`)) {
                onDeleteCampaign(campaignId);
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Campaign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
