
import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { CampaignRow } from './CampaignRow';
import { BudgetChart } from '../charts/BudgetChart';
import { AddCampaignForm } from './AddCampaignForm';
import { ExportTools } from '../export/ExportTools';

export function CampaignTable() {
  const { campaigns, weeks } = useCampaignStore();
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  
  const toggleChart = (campaignId: string) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaigns</h2>
        <div className="flex items-center gap-2">
          <ExportTools campaigns={campaigns} weeks={weeks} />
          <AddCampaignForm />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="fixed-column-header">Channel</th>
                  <th className="fixed-column-header">Campaign</th>
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
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={8 + weeks.length} className="p-8 text-center text-muted-foreground">
                      No campaigns yet. Add a campaign to get started.
                    </td>
                  </tr>
                )}
                {campaigns.map(campaign => (
                  <React.Fragment key={campaign.id}>
                    <CampaignRow 
                      campaign={campaign} 
                      weeks={weeks}
                      onToggleChart={toggleChart}
                      showChart={!!expandedCampaigns[campaign.id]}
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
