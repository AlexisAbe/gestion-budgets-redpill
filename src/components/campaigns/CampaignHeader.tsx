
import React, { useState } from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { Badge } from '@/components/ui/badge';

interface CampaignHeaderProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  campaignWeeks: number[];
  getMediaChannelClass: (mediaChannel: string) => string;
  getObjectiveClass: (objective: string) => string;
  totalAdSetsActualBudget?: number;
}

export function CampaignHeader({
  campaign,
  weeks,
  campaignWeeks,
  getMediaChannelClass,
  getObjectiveClass,
  totalAdSetsActualBudget = 0
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
  
  return (
    <>
      <td className="px-3 py-2 font-medium text-sm sticky left-0 bg-white">
        <div className="flex flex-col">
          <span>{campaign.name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {formattedStartDate} - {formattedEndDate}
          </span>
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
    </>
  );
}
