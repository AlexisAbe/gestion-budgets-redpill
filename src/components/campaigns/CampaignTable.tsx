
import React, { useState, useMemo } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { CampaignRow } from './CampaignRow';
import { BudgetChart } from '../charts/BudgetChart';
import { AddCampaignForm } from './AddCampaignForm';
import { ExportTools } from '../export/ExportTools';
import { ChannelFilter } from '../filters/ChannelFilter';
import { MediaChannel } from '@/types/campaign';
import { useClientStore } from '@/store/clientStore';
import { ScrollArea } from '../ui/scroll-area';

export function CampaignTable() {
  const { campaigns, filteredCampaigns, weeks } = useCampaignStore();
  const { selectedClientId } = useClientStore();
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [inlineAdSets, setInlineAdSets] = useState<Record<string, boolean>>({});
  const [selectedChannels, setSelectedChannels] = useState<MediaChannel[]>([]);
  
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <div className="flex items-center gap-2">
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
                <th className="fixed-column-header sticky left-0 z-20 bg-muted/50">Channel</th>
                <th className="fixed-column-header sticky left-[100px] z-20 bg-muted/50">Campaign</th>
                <th className="fixed-column-header">Objective</th>
                <th className="fixed-column-header">Target</th>
                <th className="fixed-column-header">Start</th>
                <th className="fixed-column-header">Budget</th>
                <th className="fixed-column-header">Days</th>
                <th className="fixed-column-header">Actions</th>
                
                {/* Weekly headers */}
                {weeks.map(week => (
                  <th key={week.weekLabel} className="week-header">
                    {week.weekLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card text-foreground">
              {displayedCampaigns.length === 0 && (
                <tr>
                  <td colSpan={8 + weeks.length} className="p-8 text-center text-muted-foreground">
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
                    weeks={weeks}
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
