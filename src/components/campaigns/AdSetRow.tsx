
import React from 'react';
import { AdSet, Campaign } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { WeeklyView } from '@/types/campaign';
import { ActualAdSetBudgetInput } from '../adSets/ActualAdSetBudgetInput';
import { 
  calculateAdSetWeeklyBudget,
} from '@/utils/budget/calculations';

interface AdSetRowProps {
  adSet: AdSet;
  campaign: Campaign;
  weeks: WeeklyView[];
  campaignWeeks: number[];
}

export function AdSetRow({ adSet, campaign, weeks, campaignWeeks }: AdSetRowProps) {
  return (
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
        
        return (
          <AdSetWeeklyBudgetCell
            key={`adset-${adSet.id}-${weekLabel}`}
            campaignId={campaign.id}
            adSet={adSet}
            weekLabel={weekLabel}
            isInCampaign={isInCampaign}
            weekBudget={weekBudget}
            adSetWeeklyBudget={adSetWeeklyBudget}
          />
        );
      })}
    </tr>
  );
}

interface AdSetWeeklyBudgetCellProps {
  campaignId: string;
  adSet: AdSet;
  weekLabel: string;
  isInCampaign: boolean;
  weekBudget: number;
  adSetWeeklyBudget: number;
}

function AdSetWeeklyBudgetCell({ 
  campaignId,
  adSet,
  weekLabel,
  isInCampaign, 
  weekBudget,
  adSetWeeklyBudget 
}: AdSetWeeklyBudgetCellProps) {
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
    <td className={`px-1 py-1 text-xs min-w-[80px] border-l ${!isInCampaign ? 'bg-muted/20' : ''}`}>
      {isInCampaign && weekBudget > 0 ? (
        <div className="space-y-1">
          <div className="font-medium">{formatCurrency(adSetWeeklyBudget)}</div>
          
          <ActualAdSetBudgetInput
            campaignId={campaignId}
            adSetId={adSet.id}
            weekLabel={weekLabel}
            adSetPercentage={adSet.budgetPercentage}
            plannedBudget={adSetWeeklyBudget}
            actualCampaignBudget={adSet.actualBudgets && adSet.actualBudgets[weekLabel]}
          />
          
          {adSetActualBudget > 0 && (
            <ProgressBar 
              utilizationPercentage={utilizationPercentage}
              isOverBudget={isOverBudget}
              isWithinBudget={isWithinBudget}
              adSetActualBudget={adSetActualBudget}
              adSetWeeklyBudget={adSetWeeklyBudget}
            />
          )}
        </div>
      ) : null}
    </td>
  );
}

interface ProgressBarProps {
  utilizationPercentage: number;
  isOverBudget: boolean;
  isWithinBudget: boolean;
  adSetActualBudget: number;
  adSetWeeklyBudget: number;
}

function ProgressBar({
  utilizationPercentage,
  isOverBudget,
  isWithinBudget,
  adSetActualBudget,
  adSetWeeklyBudget
}: ProgressBarProps) {
  return (
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
  );
}
