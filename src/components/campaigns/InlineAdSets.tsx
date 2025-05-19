
import React from 'react';
import { AdSet, Campaign } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { WeeklyView } from '@/types/campaign';
import { Loader2 } from 'lucide-react';
import { ActualAdSetBudgetInput } from '../adSets/ActualAdSetBudgetInput';

interface InlineAdSetsProps {
  campaign: Campaign;
  adSets: AdSet[];
  weeks: WeeklyView[];
  campaignWeeks: number[];
  isLoading: boolean;
}

export function InlineAdSets({ campaign, adSets, weeks, campaignWeeks, isLoading }: InlineAdSetsProps) {
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
            const adSetWeeklyBudget = weekBudget * adSet.budgetPercentage / 100;
            
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
                  </div>
                ) : null}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
