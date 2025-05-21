
import React from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { BadgeDollarSign } from 'lucide-react';
import { calculateWeeklyAdSetsActualBudget } from '@/utils/budget/calculations';

interface BudgetSummaryRowsProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  campaignWeeks: number[];
  weeklyPlannedTotals: Record<string, number>;
  adSets: Array<{ actualBudgets?: Record<string, number> }>;
}

export function BudgetSummaryRows({ campaign, weeks, campaignWeeks, weeklyPlannedTotals, adSets }: BudgetSummaryRowsProps) {
  return (
    <>
      <PlannedBudgetRow 
        campaign={campaign}
        weeks={weeks}
        campaignWeeks={campaignWeeks}
        weeklyPlannedTotals={weeklyPlannedTotals}
      />
      <ActualBudgetRow 
        campaign={campaign}
        weeks={weeks}
        campaignWeeks={campaignWeeks}
        adSets={adSets}
      />
    </>
  );
}

interface BudgetRowProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  campaignWeeks: number[];
  weeklyPlannedTotals: Record<string, number>;
}

function PlannedBudgetRow({ campaign, weeks, campaignWeeks, weeklyPlannedTotals }: BudgetRowProps) {
  return (
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
  );
}

interface ActualBudgetRowProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  campaignWeeks: number[];
  adSets: Array<{ actualBudgets?: Record<string, number> }>;
}

function ActualBudgetRow({ campaign, weeks, campaignWeeks, adSets }: ActualBudgetRowProps) {
  return (
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
        const plannedBudget = campaign.weeklyBudgets[weekLabel] || 0;
        
        // Calculate actual budget by summing up all ad sets' actual budgets for this week
        const actualBudget = calculateWeeklyAdSetsActualBudget(adSets, weekLabel);
        
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
  );
}
