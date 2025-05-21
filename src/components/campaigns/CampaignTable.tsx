
import React, { useState, useMemo } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { CampaignRow } from './CampaignRow';
import { BudgetChart } from '../charts/BudgetChart';
import { AddCampaignForm } from './AddCampaignForm';
import { ExportTools } from '../export/ExportTools';
import { ChannelFilter } from '../filters/ChannelFilter';
import { WeekRangeFilter } from '../filters/WeekRangeFilter';
import { MediaChannel } from '@/types/campaign';
import { useClientStore } from '@/store/clientStore';
import { ScrollArea } from '../ui/scroll-area';
import { formatDayMonth } from '@/utils/dateUtils';

export function CampaignTable() {
  const { campaigns, filteredCampaigns, weeks } = useCampaignStore();
  const { selectedClientId } = useClientStore();
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [inlineAdSets, setInlineAdSets] = useState<Record<string, boolean>>({});
  const [selectedChannels, setSelectedChannels] = useState<MediaChannel[]>([]);
  const [weekRange, setWeekRange] = useState<[number, number]>([1, weeks.length]);
  
  const toggleChart = (campaignId: string) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };
  
  const toggleInlineAdSets = (campaignId: string) => {
    setInlineAdSets(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  // Filter campaigns by selected channels
  const displayedCampaigns = useMemo(() => {
    // First filter by client (using filteredCampaigns which is already filtered by client)
    let result = filteredCampaigns;
    
    // Then filter by selected channels if any
    if (selectedChannels.length > 0) {
      result = result.filter(campaign => selectedChannels.includes(campaign.mediaChannel));
    }
    
    return result;
  }, [filteredCampaigns, selectedChannels]);
  
  // Filter weeks based on selected range
  const visibleWeeks = useMemo(() => {
    return weeks.filter((_, index) => {
      const weekNumber = index + 1;
      return weekNumber >= weekRange[0] && weekNumber <= weekRange[1];
    });
  }, [weeks, weekRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <div className="flex items-center gap-2">
          <WeekRangeFilter 
            allWeeks={weeks}
            selectedWeekRange={weekRange}
            onChange={setWeekRange}
          />
          <ChannelFilter 
            selectedChannels={selectedChannels}
            onChange={setSelectedChannels}
          />
          <ExportTools campaigns={displayedCampaigns} weeks={weeks} />
          <AddCampaignForm />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-w-full relative">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 z-20 bg-muted/50">
                  Campagne
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Canal
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Objectif
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cible
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Période
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dépensé
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
                
                {/* Weekly headers - filtered by selected range */}
                {visibleWeeks.map(week => (
                  <th 
                    key={week.weekLabel} 
                    className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-l"
                  >
                    <div className="flex flex-col items-center">
                      <span>{week.weekLabel}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {formatDayMonth(week.startDate)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Prévu/Réel
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card text-foreground">
              {displayedCampaigns.length === 0 && (
                <tr>
                  <td colSpan={8 + visibleWeeks.length} className="p-8 text-center text-muted-foreground">
                    {campaigns.length === 0 
                      ? "No campaigns yet. Add a campaign to get started."
                      : selectedClientId 
                        ? "No campaigns for this client. Add a campaign to get started."
                        : "No campaigns match your selected filters."}
                  </td>
                </tr>
              )}
              {displayedCampaigns.map(campaign => (
                <React.Fragment key={campaign.id}>
                  <CampaignRow 
                    campaign={campaign} 
                    weeks={visibleWeeks}
                    onToggleChart={toggleChart}
                    showChart={!!expandedCampaigns[campaign.id]}
                    showInlineAdSets={!!inlineAdSets[campaign.id]}
                    onToggleInlineAdSets={toggleInlineAdSets}
                  />
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
