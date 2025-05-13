
import React, { useState } from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { useCampaignStore } from '@/store/campaignStore';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/budgetUtils';
import { WeeklyBudgetInput } from '@/components/ui/WeeklyBudgetInput';
import { ActualBudgetInput } from '@/components/campaigns/ActualBudgetInput';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BudgetDistributionModal } from '@/components/ui/BudgetDistributionModal';
import { BarChart3, Trash2, PanelLeftOpen, Minimize2, Filter } from 'lucide-react';
import { getCampaignWeeks } from '@/utils/dateUtils';
import { AdSetManager } from '@/components/adSets/AdSetManager';

interface CampaignRowProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  onToggleChart: (campaignId: string) => void;
  showChart: boolean;
}

export function CampaignRow({ campaign, weeks, onToggleChart, showChart }: CampaignRowProps) {
  const { deleteCampaign, updateWeeklyBudget } = useCampaignStore();
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);
  const [isAdSetManagerOpen, setIsAdSetManagerOpen] = useState(false);
  
  // Get campaign weeks (which weeks this campaign runs in)
  const campaignWeeks = getCampaignWeeks(campaign.startDate, campaign.durationDays, weeks);
  
  // Find the appropriate CSS class based on media channel
  const getMediaChannelClass = (channel: string) => {
    switch(channel) {
      case 'META': return 'bg-blue-50 text-blue-800';
      case 'GOOGLE': return 'bg-green-50 text-green-800';
      case 'LINKEDIN': return 'bg-blue-800 text-white';
      case 'TWITTER': return 'bg-blue-400 text-white';
      case 'DISPLAY': return 'bg-purple-50 text-purple-800';
      case 'EMAIL': return 'bg-yellow-50 text-yellow-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };
  
  // Find the appropriate CSS class based on objective
  const getObjectiveClass = (objective: string) => {
    switch(objective) {
      case 'awareness': return 'bg-blue-50 text-blue-800';
      case 'consideration': return 'bg-purple-50 text-purple-800';
      case 'conversion': return 'bg-green-50 text-green-800';
      case 'loyalty': return 'bg-yellow-50 text-yellow-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <>
      <tr className="hover:bg-muted/20">
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
        <td className="px-3 py-2 align-middle">
          <div className="flex items-center justify-end gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onToggleChart(campaign.id)}
              title={showChart ? "Hide chart" : "Show chart"}
              >
              {showChart ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDistributionOpen(true)}>
                  <PanelLeftOpen className="mr-2 h-4 w-4" />
                  Distribute Budget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAdSetManagerOpen(true)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Gérer les sous-ensembles
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaign.name}" ?`)) {
                      deleteCampaign(campaign.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                    value={budgetForWeek}
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
      </tr>
      
      <BudgetDistributionModal 
        open={isDistributionOpen}
        onClose={() => setIsDistributionOpen(false)}
        campaign={campaign}
      />

      {isAdSetManagerOpen && (
        <AdSetManager
          campaign={campaign}
          open={isAdSetManagerOpen}
          onClose={() => setIsAdSetManagerOpen(false)}
        />
      )}
    </>
  );
}
