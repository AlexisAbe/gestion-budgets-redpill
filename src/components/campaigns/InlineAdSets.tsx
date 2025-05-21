
import React, { useMemo } from 'react';
import { AdSet, Campaign } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { WeeklyView } from '@/types/campaign';
import { Loader2, BadgeDollarSign } from 'lucide-react';
import { ActualAdSetBudgetInput } from '../adSets/ActualAdSetBudgetInput';
import { 
  calculateWeeklyAdSetsActualBudget,
  calculateAdSetWeeklyBudget,
  calculateTotalAdSetsWeeklyBudget
} from '@/utils/budget/calculations';

interface InlineAdSetsProps {
  campaign: Campaign;
  adSets: AdSet[];
  weeks: WeeklyView[];
  campaignWeeks: number[];
  isLoading: boolean;
}

export function InlineAdSets({ campaign, adSets, weeks, campaignWeeks, isLoading }: InlineAdSetsProps) {
  // Calculer les totaux des budgets réels par semaine
  const weeklyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weeks.forEach(week => {
      totals[week.weekLabel] = calculateWeeklyAdSetsActualBudget(adSets, week.weekLabel);
    });
    return totals;
  }, [adSets, weeks]);

  // Calculer les totaux des budgets prévus par semaine
  const weeklyPlannedTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weeks.forEach(week => {
      const weekLabel = week.weekLabel;
      const weeklyBudget = campaign.weeklyBudgets[weekLabel] || 0;
      totals[weekLabel] = calculateTotalAdSetsWeeklyBudget(adSets, weeklyBudget);
    });
    return totals;
  }, [adSets, campaign.weeklyBudgets, weeks]);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={8} className="bg-muted/5 p-2 text-center">
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Chargement des sous-ensembles...</span>
          </div>
        </td>
        {weeks.map(week => (
          <td key={`loading-${campaign.id}-${week.weekLabel}`} className="bg-muted/5"></td>
        ))}
      </tr>
    );
  }

  if (!adSets || adSets.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="bg-muted/5 p-2 text-center">
          <div className="text-sm text-muted-foreground py-2">
            Pas de sous-ensembles pour cette campagne
          </div>
        </td>
        {weeks.map(week => (
          <td key={`empty-${campaign.id}-${week.weekLabel}`} className="bg-muted/5"></td>
        ))}
      </tr>
    );
  }

  return (
    <>
      {adSets.map(adSet => (
        <tr key={`adset-${adSet.id}`} className="bg-muted/5 hover:bg-muted/10">
          <td className="pl-8 py-1 text-xs sticky left-0 bg-muted/5 z-10" colSpan={2}>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <span className="font-medium break-words">{adSet.name}</span>
            </div>
          </td>
          <td colSpan={1} className="px-3 py-1 text-xs">
            {adSet.budgetPercentage}%
          </td>
          <td colSpan={1} className="px-3 py-1 text-xs">
            {adSet.targetAudience || '-'}
          </td>
          <td colSpan={4} className="px-3 py-1 text-xs">
            {formatCurrency(campaign.totalBudget * adSet.budgetPercentage / 100)}
          </td>
          
          {weeks.map((week) => {
            const isInCampaign = campaignWeeks.includes(week.weekNumber);
            const weekLabel = week.weekLabel;
            const weekBudget = campaign.weeklyBudgets[weekLabel] || 0;
            const adSetWeeklyBudget = calculateAdSetWeeklyBudget(weekBudget, adSet.budgetPercentage);
            
            // Récupérer le budget réel pour cet ad set et cette semaine
            const adSetActualBudget = adSet.actualBudgets && adSet.actualBudgets[weekLabel] || 0;
            
            // Déterminer si le budget réel dépasse le budget prévu
            const isOverBudget = adSetActualBudget > adSetWeeklyBudget;
            const isWithinBudget = adSetActualBudget > 0 && adSetActualBudget <= adSetWeeklyBudget;
            
            // Calculer le pourcentage d'utilisation pour la barre de progression
            const utilizationPercentage = adSetWeeklyBudget > 0 
              ? Math.min(100, (adSetActualBudget / adSetWeeklyBudget) * 100)
              : 0;
            
            return (
              <td 
                key={`adset-${adSet.id}-${weekLabel}`} 
                className={`px-1 py-1 text-xs min-w-[80px] border-l ${!isInCampaign ? 'bg-muted/20' : ''}`}
              >
                {isInCampaign && weekBudget > 0 ? (
                  <div className="space-y-1">
                    <div className="font-medium">{formatCurrency(adSetWeeklyBudget)}</div>
                    
                    <ActualAdSetBudgetInput
                      campaignId={campaign.id}
                      adSetId={adSet.id}
                      weekLabel={weekLabel}
                      adSetPercentage={adSet.budgetPercentage}
                      plannedBudget={adSetWeeklyBudget}
                      actualCampaignBudget={campaign.actualBudgets && campaign.actualBudgets[weekLabel]}
                    />
                    
                    {adSetActualBudget > 0 && (
                      <div className="w-full mt-1">
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${utilizationPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-0.5">
                          <span className={`text-[10px] ${
                            isOverBudget 
                              ? 'text-red-500 font-semibold' 
                              : isWithinBudget 
                                ? 'text-green-500' 
                                : ''
                          }`}>
                            {isOverBudget ? '+' : ''}{Math.abs(adSetActualBudget - adSetWeeklyBudget).toFixed(2)}€
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {utilizationPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            );
          })}
        </tr>
      ))}

      {/* Ligne totale pour les budgets prévus */}
      <tr className="border-t border-gray-300 bg-muted/10">
        <td colSpan={8} className="px-3 py-2 text-xs font-bold">
          <div className="flex items-center">
            <BadgeDollarSign className="w-4 h-4 mr-1 text-green-600" />
            Total Budget Prévu
          </div>
        </td>
        {weeks.map(week => {
          const isInCampaign = campaignWeeks.includes(week.weekNumber);
          const weekLabel = week.weekLabel;
          const weeklyTotal = weeklyPlannedTotals[weekLabel] || 0;
          const campaignWeeklyBudget = campaign.weeklyBudgets[weekLabel] || 0;
          
          return (
            <td 
              key={`planned-total-${campaign.id}-${weekLabel}`}
              className={`px-3 py-2 text-xs font-bold border-l ${!isInCampaign ? 'bg-muted/20' : ''}`}
            >
              {isInCampaign && campaignWeeklyBudget > 0 ? (
                <div className="text-green-600">{formatCurrency(campaignWeeklyBudget)}</div>
              ) : null}
            </td>
          );
        })}
      </tr>

      {/* Ligne totale pour les budgets réels */}
      <tr className="border-t border-gray-300 bg-muted/10">
        <td colSpan={8} className="px-3 py-2 text-xs font-bold">
          <div className="flex items-center">
            <BadgeDollarSign className="w-4 h-4 mr-1 text-blue-600" />
            Total Budget Réel Dépensé
          </div>
        </td>
        {weeks.map(week => {
          const isInCampaign = campaignWeeks.includes(week.weekNumber);
          const weekLabel = week.weekLabel;
          const actualBudget = campaign.actualBudgets && campaign.actualBudgets[weekLabel] || 0;
          const plannedBudget = campaign.weeklyBudgets[weekLabel] || 0;
          
          // Déterminer la classe de couleur en fonction de l'écart entre réel et prévu
          const isOverBudget = actualBudget > plannedBudget;
          const isWithinBudget = actualBudget > 0 && actualBudget <= plannedBudget * 0.98; // 2% de marge pour être considéré dans le budget
          
          let textColorClass = '';
          if (actualBudget > 0) {
            textColorClass = isOverBudget ? 'text-red-600' : isWithinBudget ? 'text-green-600' : 'text-blue-600';
          }
          
          return (
            <td 
              key={`total-${campaign.id}-${week.weekLabel}`}
              className={`px-3 py-2 text-xs font-bold border-l ${!isInCampaign ? 'bg-muted/20' : ''}`}
            >
              {isInCampaign && plannedBudget > 0 && actualBudget > 0 ? (
                <div className={textColorClass}>
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
              ) : (isInCampaign && plannedBudget > 0 ? (
                <div className="text-muted-foreground opacity-50">-</div>
              ) : null)}
            </td>
          );
        })}
      </tr>
    </>
  );
}
