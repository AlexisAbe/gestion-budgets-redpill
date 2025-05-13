
import React, { useState, useEffect } from 'react';
import { Campaign, WeeklyView, AdSet } from '@/types/campaign';
import { useCampaignStore } from '@/store/campaignStore';
import { useAdSetStore } from '@/store/adSetStore';
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
import { AdSetDetails } from '@/components/adSets/AdSetDetails';
import { BudgetChart } from '@/components/charts/BudgetChart';
import { Loader2 } from 'lucide-react';

interface CampaignRowProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  onToggleChart: (campaignId: string) => void;
  showChart: boolean;
  showInlineAdSets: boolean;
  onToggleInlineAdSets: (campaignId: string) => void;
}

export function CampaignRow({ campaign, weeks, onToggleChart, showChart, showInlineAdSets, onToggleInlineAdSets }: CampaignRowProps) {
  const { deleteCampaign, updateWeeklyBudget } = useCampaignStore();
  const { adSets, fetchAdSets, isLoading } = useAdSetStore();
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);
  const [isAdSetManagerOpen, setIsAdSetManagerOpen] = useState(false);
  const [showAdSets, setShowAdSets] = useState(false);
  
  // Fetch ad sets when inline display is enabled
  useEffect(() => {
    if (showInlineAdSets && (!adSets[campaign.id] || adSets[campaign.id].length === 0)) {
      fetchAdSets(campaign.id);
    }
  }, [showInlineAdSets, campaign.id, fetchAdSets, adSets]);
  
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
  
  // Get campaign ad sets
  const campaignAdSets = adSets[campaign.id] || [];

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

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onToggleInlineAdSets(campaign.id)}
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
                <DropdownMenuItem onClick={() => setIsDistributionOpen(true)}>
                  <PanelLeftOpen className="mr-2 h-4 w-4" />
                  Distribute Budget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAdSetManagerOpen(true)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Gérer les sous-ensembles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAdSets(!showAdSets)}>
                  <Filter className="mr-2 h-4 w-4" />
                  {showAdSets ? "Masquer les sous-ensembles" : "Afficher les sous-ensembles"}
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
      </tr>
      
      {/* Inline AdSets rows */}
      {showInlineAdSets && (
        <>
          {isLoading ? (
            <tr>
              <td colSpan={8} className="bg-muted/5 p-2 text-center">
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">Chargement des sous-ensembles...</span>
                </div>
              </td>
              {/* Empty cells for weekly columns */}
              {weeks.map(week => (
                <td key={`loading-${campaign.id}-${week.weekLabel}`} className="bg-muted/5"></td>
              ))}
            </tr>
          ) : campaignAdSets.length === 0 ? (
            <tr>
              <td colSpan={8} className="bg-muted/5 p-2 text-center">
                <div className="text-sm text-muted-foreground py-2">
                  Pas de sous-ensembles pour cette campagne
                </div>
              </td>
              {/* Empty cells for weekly columns */}
              {weeks.map(week => (
                <td key={`empty-${campaign.id}-${week.weekLabel}`} className="bg-muted/5"></td>
              ))}
            </tr>
          ) : (
            campaignAdSets.map(adSet => (
              <tr key={`adset-${adSet.id}`} className="bg-muted/5 hover:bg-muted/10">
                <td className="pl-8 py-1 text-xs" colSpan={2}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    <span className="font-medium">{adSet.name}</span>
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
                
                {/* Weekly budget cells for each ad set */}
                {weeks.map((week) => {
                  const isInCampaign = campaignWeeks.includes(week.weekNumber);
                  const weekLabel = week.weekLabel;
                  const weekBudget = campaign.weeklyBudgets[weekLabel] || 0;
                  const adSetWeeklyBudget = weekBudget * adSet.budgetPercentage / 100;
                  
                  return (
                    <td 
                      key={`adset-${adSet.id}-${weekLabel}`} 
                      className={`px-1 py-1 text-right text-xs min-w-[80px] border-l ${!isInCampaign ? 'bg-muted/20' : ''}`}
                    >
                      {isInCampaign && weekBudget > 0 ? (
                        <>
                          <div className="font-medium">{formatCurrency(adSetWeeklyBudget)}</div>
                          {campaign.actualBudgets && campaign.actualBudgets[weekLabel] ? (
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(campaign.actualBudgets[weekLabel] * adSet.budgetPercentage / 100)}
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </>
      )}

      {/* AdSet details row (full width details) */}
      {showAdSets && (
        <tr>
          <td colSpan={8 + weeks.length} className="bg-muted/10 p-4">
            <AdSetDetails campaign={campaign} />
          </td>
        </tr>
      )}

      {/* Chart row */}
      {showChart && (
        <tr>
          <td colSpan={8 + weeks.length} className="bg-muted/20 p-4">
            <BudgetChart campaign={campaign} weeks={weeks} />
          </td>
        </tr>
      )}
      
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
