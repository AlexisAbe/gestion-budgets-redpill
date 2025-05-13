
import { create } from 'zustand';
import { initialCampaignState, CampaignState } from './types/campaignStoreTypes';
import { createCampaignActions } from './actions/campaignActions';
import { setupClientSubscription } from './subscriptions/clientSubscription';

// Create the campaign store with refactored actions
export const useCampaignStore = create<CampaignState>()((set, get) => {
  return {
    ...initialCampaignState,
    ...createCampaignActions(set, get)
  };
});

// Setup the client store subscription
setupClientSubscription();
