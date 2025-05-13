
import { useClientStore } from '../clientStore';
import { useCampaignStore } from '../campaignStore';

export const setupClientSubscription = () => {
  // Subscribe to changes in the client store
  useClientStore.subscribe((state) => {
    const { selectedClientId } = state;
    const campaignStore = useCampaignStore.getState();
    const filteredCampaigns = selectedClientId 
      ? campaignStore.campaigns.filter(campaign => campaign.clientId === selectedClientId)
      : campaignStore.campaigns;
      
    useCampaignStore.setState({ filteredCampaigns });
  });
};
