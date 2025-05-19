
import React, { useEffect, useState, useMemo } from 'react';
import { useAdSetStore } from '@/store/adSetStore';
import { Campaign } from '@/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budgetUtils';
import { Loader2 } from 'lucide-react';
import { calculateTotalAdSetsActualBudget } from '@/utils/budget/calculations';

interface AdSetDetailsProps {
  campaign: Campaign;
}

export function AdSetDetails({ campaign }: AdSetDetailsProps) {
  const { adSets, fetchAdSets, isLoading } = useAdSetStore();
  const [hasTriedFetching, setHasTriedFetching] = useState(false);
  
  useEffect(() => {
    const campaignAdSets = adSets[campaign.id];
    if (!campaignAdSets && !hasTriedFetching && !isLoading) {
      setHasTriedFetching(true);
      fetchAdSets(campaign.id);
    }
  }, [campaign.id, adSets, fetchAdSets, hasTriedFetching, isLoading]);
  
  const campaignAdSets = adSets[campaign.id] || [];
  
  // Calculer le budget réel total
  const totalActualBudget = useMemo(() => {
    return calculateTotalAdSetsActualBudget(campaignAdSets);
  }, [campaignAdSets]);
  
  if (isLoading && hasTriedFetching) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (campaignAdSets.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Pas de sous-ensembles définis pour cette campagne.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Sous-ensembles de publicité</h3>
        {totalActualBudget > 0 && (
          <div className="text-sm font-semibold bg-primary/10 px-3 py-1 rounded-full">
            Budget réel total: {formatCurrency(totalActualBudget)}
          </div>
        )}
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {campaignAdSets.map((adSet) => {
          const budgetAmount = campaign.totalBudget * (adSet.budgetPercentage / 100);
          
          // Calculer le budget réel total pour ce sous-ensemble
          const adSetActualBudget = adSet.actualBudgets ? 
            Object.values(adSet.actualBudgets).reduce((sum, amount) => sum + amount, 0) : 
            0;
          
          return (
            <Card key={adSet.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{adSet.name}</CardTitle>
                  <div className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {adSet.budgetPercentage}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Budget prévu:</span>
                  <span>{formatCurrency(budgetAmount)}</span>
                </div>
                
                {adSetActualBudget > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Budget réel dépensé:</span>
                    <span className={adSetActualBudget > budgetAmount ? 'text-red-500' : 'text-green-500'}>
                      {formatCurrency(adSetActualBudget)}
                    </span>
                  </div>
                )}
                
                {adSet.targetAudience && (
                  <div>
                    <span className="font-medium">Audience cible:</span> {adSet.targetAudience}
                  </div>
                )}
                
                {adSet.description && (
                  <div>
                    <span className="font-medium">Description:</span> {adSet.description}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
