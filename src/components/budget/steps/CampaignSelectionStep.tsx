
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Campaign } from '@/types/campaign';

interface CampaignSelectionStepProps {
  campaigns: Campaign[];
  selectedCampaigns: string[];
  onToggleCampaign: (campaignId: string) => void;
}

export function CampaignSelectionStep({ campaigns, selectedCampaigns, onToggleCampaign }: CampaignSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter campaigns based on search query
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sélectionnez les campagnes</h3>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une campagne..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <ScrollArea className="h-[280px] border rounded-md p-3">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            {searchQuery ? "Aucune campagne ne correspond à votre recherche" : "Aucune campagne disponible"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCampaigns.map(campaign => (
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
