
import React, { useEffect } from 'react';
import { useAdSetStore } from '@/store/adSetStore';
import { Campaign } from '@/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/budgetUtils';
import { Loader2 } from 'lucide-react';

interface AdSetDetailsProps {
  campaign: Campaign;
}

export function AdSetDetails({ campaign }: AdSetDetailsProps) {
  const { adSets, fetchAdSets, isLoading } = useAdSetStore();
  
  useEffect(() => {
    fetchAdSets(campaign.id);
  }, [campaign.id, fetchAdSets]);
  
  const campaignAdSets = adSets[campaign.id] || [];
  
  if (isLoading) {
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
      <h3 className="font-medium text-lg">Sous-ensembles de publicité</h3>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {campaignAdSets.map((adSet) => {
          const budgetAmount = campaign.totalBudget * (adSet.budgetPercentage / 100);
          
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
                <div className="font-medium">{formatCurrency(budgetAmount)}</div>
                
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
