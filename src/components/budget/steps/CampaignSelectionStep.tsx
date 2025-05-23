
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Campaign } from '@/types/campaign';

interface CampaignSelectionStepProps {
  campaigns: Campaign[];
  selectedCampaigns: string[];
  onToggleCampaign: (campaignId: string) => void;
}

export function CampaignSelectionStep({ campaigns, selectedCampaigns, onToggleCampaign }: CampaignSelectionStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sélectionnez les campagnes</h3>
      <ScrollArea className="h-[280px] border rounded-md p-3">
        {campaigns.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Aucune campagne disponible
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map(campaign => (
              <div 
                key={campaign.id} 
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => onToggleCampaign(campaign.id)}
              >
                <Checkbox 
                  id={`campaign-${campaign.id}`}
                  checked={selectedCampaigns.includes(campaign.id)}
                  onCheckedChange={() => onToggleCampaign(campaign.id)}
                />
                <Label 
                  htmlFor={`campaign-${campaign.id}`}
                  className="cursor-pointer flex-grow"
                >
                  {campaign.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
