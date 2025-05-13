
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign, MediaChannel } from '@/types/campaign';
import { calculateTotalBudget, calculateTotalActualBudget } from '@/utils/budgetUtils';

interface ChannelBudgetSummaryProps {
  campaigns: Campaign[];
}

export function ChannelBudgetSummary({ campaigns }: ChannelBudgetSummaryProps) {
  // Group campaigns by channel
  const channelGroups = campaigns.reduce<Record<string, Campaign[]>>((acc, campaign) => {
    const channel = campaign.mediaChannel;
    if (!acc[channel]) {
      acc[channel] = [];
    }
    acc[channel].push(campaign);
    return acc;
  }, {});

  // Calculate totals for each channel
  const channelSummaries = Object.entries(channelGroups).map(([channel, channelCampaigns]) => {
    const plannedBudget = channelCampaigns.reduce((sum, campaign) => 
      sum + calculateTotalBudget(campaign), 0);
    
    const actualBudget = channelCampaigns.reduce((sum, campaign) => 
      sum + calculateTotalActualBudget(campaign), 0);
    
    return {
      channel,
      plannedBudget,
      actualBudget,
      campaignCount: channelCampaigns.length
    };
  });

  // Debug logging to verify actual budget calculation
  console.log('Channel summaries with actual budgets:', channelSummaries);
  
  // Create total summary
  const totalPlanned = channelSummaries.reduce((sum, summary) => sum + summary.plannedBudget, 0);
  const totalActual = channelSummaries.reduce((sum, summary) => sum + summary.actualBudget, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Budget par Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 font-medium text-sm pb-2 border-b">
            <div>Canal</div>
            <div>Prévu</div>
            <div>Dépensé</div>
            <div>Progression</div>
          </div>
          
          {channelSummaries.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              Aucune campagne disponible
            </div>
          ) : (
            <>
              {channelSummaries.map(summary => (
                <div key={summary.channel} className="grid grid-cols-4 gap-2 py-2 text-sm">
                  <div className="font-medium">{summary.channel}</div>
                  <div>{summary.plannedBudget.toLocaleString('fr-FR')} €</div>
                  <div>{summary.actualBudget.toLocaleString('fr-FR')} €</div>
                  <div>
                    {summary.plannedBudget > 0 ? (
                      <div className="flex items-center">
                        <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, (summary.actualBudget / summary.plannedBudget) * 100)}%` }} 
                          />
                        </div>
                        <span className="text-xs">
                          {Math.round((summary.actualBudget / summary.plannedBudget) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Total row */}
              <div className="grid grid-cols-4 gap-2 py-2 text-sm font-semibold border-t mt-2 pt-2">
                <div>Total</div>
                <div>{totalPlanned.toLocaleString('fr-FR')} €</div>
                <div>{totalActual.toLocaleString('fr-FR')} €</div>
                <div>
                  {calculatePercentage(totalActual, totalPlanned)}%
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate percentage
function calculatePercentage(actual: number, planned: number): number {
  if (planned === 0) return 0;
  return Math.round((actual / planned) * 100);
}
