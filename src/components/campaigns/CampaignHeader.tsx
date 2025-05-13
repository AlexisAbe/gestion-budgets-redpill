
import React from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/budgetUtils';
import { WeeklyBudgetInput } from '@/components/ui/WeeklyBudgetInput';
import { ActualBudgetInput } from '@/components/campaigns/ActualBudgetInput';

interface CampaignHeaderProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  campaignWeeks: number[];
  getMediaChannelClass: (channel: string) => string;
  getObjectiveClass: (objective: string) => string;
}

export function CampaignHeader({ 
  campaign, 
  weeks, 
  campaignWeeks, 
  getMediaChannelClass, 
  getObjectiveClass 
}: CampaignHeaderProps) {
  return (
    <>
      {/* Fixed columns */}
      <td className="px-3 py-2 align-middle">
        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getMediaChannelClass(campaign.mediaChannel)}`}>
          {campaign.mediaChannel}
        </span>
      </td>
      <td className="px-3 py-2 align-middle max-w-[200px]">
        <div className="font-medium truncate">{campaign.name}</div>
      </td>
      <td className="px-3 py-2 align-middle">
        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getObjectiveClass(campaign.objective)}`}>
          {campaign.objective}
        </span>
      </td>
      <td className="px-3 py-2 align-middle max-w-[150px]">
        <div className="text-sm truncate" title={campaign.targetAudience}>
          {campaign.targetAudience}
        </div>
      </td>
      <td className="px-3 py-2 align-middle whitespace-nowrap">
        <div className="text-sm">{formatDate(campaign.startDate)}</div>
      </td>
      <td className="px-3 py-2 align-middle text-right">
        <div className="font-medium">{formatCurrency(campaign.totalBudget)}</div>
      </td>
      <td className="px-3 py-2 align-middle text-right">
        <div className="font-medium">{campaign.durationDays}</div>
      </td>
      
      {/* Actions column will be handled by CampaignActions component */}
      <td className="px-3 py-2 align-middle">
        {/* This will be replaced by the CampaignActions component */}
      </td>
      
      {/* Weekly columns */}
      {weeks.map((week) => {
        const isInCampaign = campaignWeeks.includes(week.weekNumber);
        const weekLabel = week.weekLabel;
        const budgetForWeek = campaign.weeklyBudgets[weekLabel] || 0;
        
        return (
          <td 
            key={`${campaign.id}-${weekLabel}`} 
            className={`px-1 py-1 text-right min-w-[80px] border-l ${!isInCampaign ? 'bg-muted/20' : ''}`}
          >
            {isInCampaign ? (
              <div className="space-y-2">
                <WeeklyBudgetInput 
                  campaignId={campaign.id}
                  weekLabel={weekLabel}
                  plannedBudget={budgetForWeek}
                />
                <ActualBudgetInput 
                  campaignId={campaign.id}
                  weekLabel={weekLabel}
                  plannedBudget={budgetForWeek}
                />
              </div>
            ) : null}
          </td>
        );
      })}
    </>
  );
}
