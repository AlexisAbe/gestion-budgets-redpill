
import React, { useState } from 'react';
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { WeeklyBudgetInput } from '@/components/ui/WeeklyBudgetInput';
import { BudgetDistributionModal } from '@/components/ui/BudgetDistributionModal';
import { Button } from '@/components/ui/button';
import { formatCurrency, isBudgetBalanced, getUnallocatedBudget } from '@/utils/budgetUtils';
import { formatDate } from '@/utils/dateUtils';
import { AlertCircle, Check, Sliders, BarChartIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ActualBudgetInput } from './ActualBudgetInput';

interface CampaignRowProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  onToggleChart: (campaignId: string) => void;
  showChart: boolean;
}

export function CampaignRow({ campaign, weeks, onToggleChart, showChart }: CampaignRowProps) {
  const isBalanced = isBudgetBalanced(campaign);
  const unallocatedBudget = getUnallocatedBudget(campaign);
  
  return (
    <>
      {/* Planned Budget Row */}
      <tr className="campaign-row">
        <td className="fixed-column-cell">
          <Badge variant={campaign.mediaChannel === 'META' ? 'default' : 'outline'} className="font-normal">
            {campaign.mediaChannel}
          </Badge>
        </td>
        <td className="fixed-column-cell font-medium">
          <div className="flex items-center gap-2">
            <span>{campaign.name}</span>
            {!isBalanced && (
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Budget mismatch: {formatCurrency(unallocatedBudget)} unallocated</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isBalanced && (
              <Tooltip>
                <TooltipTrigger>
                  <Check className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Budget perfectly balanced</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </td>
        <td className="fixed-column-cell">
          <Badge variant="secondary" className="font-normal capitalize">
            {campaign.objective}
          </Badge>
        </td>
        <td className="fixed-column-cell">{campaign.targetAudience}</td>
        <td className="fixed-column-cell">{formatDate(campaign.startDate)}</td>
        <td className="fixed-column-cell font-medium">{formatCurrency(campaign.totalBudget)}</td>
        <td className="fixed-column-cell">{campaign.durationDays}</td>
        <td className="fixed-column-cell">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onToggleChart(campaign.id)}
              className="h-6 w-6"
            >
              <Sliders className="h-3 w-3" />
            </Button>
            
            <BudgetDistributionModal 
              campaign={campaign} 
              trigger={
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  Auto-Distribute
                </Button>
              } 
            />
            
            <Badge variant="outline" className="bg-blue-50 text-xs">Planifié</Badge>
          </div>
        </td>
        
        {/* Dynamic weekly budget columns - Planned */}
        {weeks.map(week => (
          <td key={week.weekLabel} className="budget-cell">
            <WeeklyBudgetInput
              campaignId={campaign.id}
              weekLabel={week.weekLabel}
              value={campaign.weeklyBudgets[week.weekLabel] || 0}
            />
          </td>
        ))}
      </tr>
      
      {/* Actual Budget Row */}
      <tr className="campaign-row bg-muted/30">
        <td className="fixed-column-cell"></td>
        <td className="fixed-column-cell font-medium"></td>
        <td className="fixed-column-cell"></td>
        <td className="fixed-column-cell"></td>
        <td className="fixed-column-cell"></td>
        <td className="fixed-column-cell"></td>
        <td className="fixed-column-cell"></td>
        <td className="fixed-column-cell">
          <div className="flex items-center gap-2 justify-end">
            <Badge variant="outline" className="bg-green-50 text-xs">Réel</Badge>
          </div>
        </td>
        
        {/* Dynamic weekly budget columns - Actual */}
        {weeks.map(week => (
          <td key={week.weekLabel} className="budget-cell">
            <ActualBudgetInput
              campaignId={campaign.id}
              weekLabel={week.weekLabel}
              plannedBudget={campaign.weeklyBudgets[week.weekLabel] || 0}
            />
          </td>
        ))}
      </tr>
    </>
  );
}
