
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign, MediaChannel, AdSet } from '@/types/campaign';
import { calculateTotalBudget } from '@/utils/budget/calculations';
import { useAdSetStore } from '@/store/adSetStore';
import { useMemo } from 'react';

interface ChannelBudgetSummaryProps {
  campaigns: Campaign[];
}

export function ChannelBudgetSummary({ campaigns }: ChannelBudgetSummaryProps) {
  // Récupérer les ad sets depuis le store
  const { adSets } = useAdSetStore();

  // Calculer les données par canal en tenant compte des ad sets
  const { channelSummaries, totalPlanned, totalActual } = useMemo(() => {
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
    const summaries = Object.entries(channelGroups).map(([channel, channelCampaigns]) => {
      // Calculate planned budget from campaign weekly budgets
      const plannedBudget = channelCampaigns.reduce((sum, campaign) => 
        sum + calculateTotalBudget(campaign), 0);
      
      // Get all ad sets for these campaigns
      const channelAdSets: AdSet[] = [];
      channelCampaigns.forEach(campaign => {
        const campaignAdSets = adSets[campaign.id] || [];
        channelAdSets.push(...campaignAdSets);
      });
      
      // Calculate actual budget from ad sets
      const actualBudget = channelAdSets.reduce((sum, adSet) => {
        if (!adSet.actualBudgets) return sum;
        return sum + Object.values(adSet.actualBudgets).reduce((adSetSum, amount) => {
          const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
          return adSetSum + numAmount;
        }, 0);
      }, 0);
      
      return {
        channel,
        plannedBudget,
        actualBudget,
        campaignCount: channelCampaigns.length
      };
    });

    // Calculate totals
    const totalPlannedBudget = summaries.reduce((sum, summary) => sum + summary.plannedBudget, 0);
    const totalActualBudget = summaries.reduce((sum, summary) => sum + summary.actualBudget, 0);

    return {
      channelSummaries: summaries,
      totalPlanned: totalPlannedBudget,
      totalActual: totalActualBudget
    };
  }, [campaigns, adSets]);

  // Debug logging
  console.log('Channel summaries with actual budgets from ad sets:', channelSummaries);
  
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
                            className={`${summary.actualBudget > summary.plannedBudget ? 'bg-red-500' : 'bg-primary'} h-2.5 rounded-full`} 
                            style={{ width: `${Math.min(100, (summary.actualBudget / summary.plannedBudget) * 100)}%` }} 
                          />
                        </div>
                        <span className={`text-xs ${summary.actualBudget > summary.plannedBudget ? 'text-red-600 font-semibold' : ''}`}>
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
                  {totalPlanned > 0 ? (
                    <span className={totalActual > totalPlanned ? 'text-red-600' : ''}>
                      {calculatePercentage(totalActual, totalPlanned)}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
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
