
import React, { useState } from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { Badge } from '@/components/ui/badge';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  calculateWeeklyAdSetsActualBudget,
  calculateTotalAdSetsWeeklyBudget
} from '@/utils/budget/calculations';

interface CampaignHeaderProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  campaignWeeks: number[];
  getMediaChannelClass: (mediaChannel: string) => string;
  getObjectiveClass: (objective: string) => string;
  totalAdSetsActualBudget?: number;
  adSets?: Array<{ actualBudgets?: Record<string, number>, budgetPercentage: number }>;
  onOpenDistribution?: () => void;
  onOpenAdSetManager?: () => void;
  onToggleAdSets?: () => void;
  onToggleChart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showAdSets?: boolean;
  showInlineAdSets?: boolean;
  onToggleInlineAdSets?: () => void;
}

export function CampaignHeader({
  campaign,
  weeks,
  campaignWeeks,
  getMediaChannelClass,
  getObjectiveClass,
  totalAdSetsActualBudget = 0,
  adSets = [],
  onOpenDistribution,
  onOpenAdSetManager,
  onToggleAdSets,
  onToggleChart,
  onEdit,
  onDelete,
  showAdSets,
  showInlineAdSets,
  onToggleInlineAdSets
}: CampaignHeaderProps) {
  // Vérifier les dates de début et de fin
  const startDate = new Date(campaign.startDate);
  const formattedStartDate = startDate.toLocaleDateString('fr-FR');
  
  // Calculer la date de fin en ajoutant la durée en jours à la date de début
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + campaign.durationDays);
  const formattedEndDate = endDate.toLocaleDateString('fr-FR');
  
  // Trouver les semaines qui contiennent la campagne
  const campaignWeekLabels = weeks
    .filter(week => campaignWeeks.includes(week.weekNumber))
    .map(week => week.weekLabel);
  
  const isMultipleWeeks = campaignWeekLabels.length > 1;
  const weekLabel = isMultipleWeeks 
    ? `${campaignWeekLabels[0]} - ${campaignWeekLabels[campaignWeekLabels.length - 1]}`
    : campaignWeekLabels[0] || '-';
  
  // Calculate total weekly budget
  const totalWeeklyBudget = Object.entries(campaign.weeklyBudgets)
    .filter(([week]) => campaignWeekLabels.includes(week))
    .reduce((sum, [_, amount]) => sum + amount, 0);
  
  // Quick actions dropdown menu
  const QuickActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-white">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            Modifier
          </DropdownMenuItem>
        )}
        
        {onOpenDistribution && (
          <DropdownMenuItem onClick={onOpenDistribution}>
            Distribution du budget
          </DropdownMenuItem>
        )}
        
        {onOpenAdSetManager && (
          <DropdownMenuItem onClick={onOpenAdSetManager}>
            Sous-ensembles
          </DropdownMenuItem>
        )}
        
        {onToggleInlineAdSets && (
          <DropdownMenuItem onClick={onToggleInlineAdSets}>
            {showInlineAdSets ? "Masquer les sous-ensembles" : "Afficher les sous-ensembles"}
          </DropdownMenuItem>
        )}
        
        {onToggleAdSets && (
          <DropdownMenuItem onClick={onToggleAdSets}>
            {showAdSets ? "Masquer les détails" : "Afficher les détails"}
          </DropdownMenuItem>
        )}
        
        {onToggleChart && (
          <DropdownMenuItem onClick={onToggleChart}>
            Graphique de budget
          </DropdownMenuItem>
        )}
        
        {onDelete && (
          <DropdownMenuSeparator />
        )}
        
        {onDelete && (
          <DropdownMenuItem className="text-red-600" onClick={onDelete}>
            Supprimer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <>
      <td className="px-3 py-2 font-medium text-sm sticky left-0 bg-white">
        <div className="flex items-center">
          <QuickActionsDropdown />
          <div className="flex flex-col ml-2">
            <span>{campaign.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {formattedStartDate} - {formattedEndDate}
            </span>
          </div>
        </div>
      </td>
      <td className="px-2 py-2 text-sm">
        <Badge 
          variant="outline" 
          className={`${getMediaChannelClass(campaign.mediaChannel)} px-2 py-0.5 text-xs font-medium rounded`}
        >
          {campaign.mediaChannel}
        </Badge>
      </td>
      <td className="px-2 py-2 text-sm">
        <Badge 
          variant="outline" 
          className={`${getObjectiveClass(campaign.objective)} px-2 py-0.5 text-xs font-medium rounded`}
        >
          {campaign.objective}
        </Badge>
      </td>
      <td className="px-3 py-2 text-sm">
        {campaign.targetAudience}
      </td>
      <td className="px-3 py-2 text-sm font-medium">
        {formatCurrency(campaign.totalBudget)}
      </td>
      <td className="px-3 py-2 text-sm">
        <div className="flex flex-col">
          <span>{weekLabel}</span>
          <span className="text-xs text-muted-foreground">{campaign.durationDays} jours</span>
          <span className="text-xs font-medium">{formatCurrency(totalWeeklyBudget)}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-sm">
        {formatCurrency(totalAdSetsActualBudget)}
      </td>
      <td className="px-3 py-2 text-sm">
        <div className="flex items-center space-x-1">
          <span>{campaign.id.substring(0, 8)}</span>
        </div>
      </td>

      {/* Ajout des résumés hebdomadaires */}
      {weeks.map(week => {
        const isInCampaign = campaignWeeks.includes(week.weekNumber);
        const weekLabel = week.weekLabel;
        
        // Budget prévisionnel de la semaine
        const plannedBudget = campaign.weeklyBudgets[weekLabel] || 0;
        
        // Budget réel dépensé pour cette semaine (tous les ad sets)
        const actualBudget = calculateWeeklyAdSetsActualBudget(adSets, weekLabel);
        
        // Déterminer la classe de couleur en fonction de l'écart entre réel et prévu
        const isOverBudget = actualBudget > plannedBudget && plannedBudget > 0;
        const isWithinBudget = actualBudget > 0 && actualBudget <= plannedBudget * 0.98 && plannedBudget > 0;
        
        let textColorClass = '';
        if (actualBudget > 0) {
          textColorClass = isOverBudget ? 'text-red-600' : isWithinBudget ? 'text-green-600' : 'text-blue-600';
        }
        
        return (
          <td 
            key={`campaign-summary-${campaign.id}-${weekLabel}`}
            className={`px-3 py-2 text-xs border-l ${!isInCampaign ? 'bg-muted/20' : ''}`}
          >
            {isInCampaign && plannedBudget > 0 ? (
              <div className="flex flex-col space-y-1">
                <div className="font-medium text-green-600">
                  {formatCurrency(plannedBudget)}
                </div>
                
                {actualBudget > 0 && (
                  <div className={`font-medium ${textColorClass}`}>
                    {formatCurrency(actualBudget)}
                    {isOverBudget && (
                      <span className="ml-1 bg-red-100 text-red-600 px-1 py-0.5 rounded text-[10px]">
                        +{((actualBudget / plannedBudget - 1) * 100).toFixed(0)}%
                      </span>
                    )}
                    {isWithinBudget && (
                      <span className="ml-1 bg-green-100 text-green-600 px-1 py-0.5 rounded text-[10px]">
                        {((actualBudget / plannedBudget) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </td>
        );
      })}
    </>
  );
}
