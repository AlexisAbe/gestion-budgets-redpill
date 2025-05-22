
import { create } from 'zustand';
import { initialCampaignState, CampaignState } from './types/campaignStoreTypes';
import { createCampaignActions } from './actions/createCampaignActions';
import { setupClientSubscription } from './subscriptions/clientSubscription';
import { generateWeeksForYear } from '@/utils/dateUtils';
import { useGlobalBudgetStore } from './globalBudgetStore';

// Create the campaign store with refactored actions
export const useCampaignStore = create<CampaignState>()((set, get) => {
  return {
    ...initialCampaignState,
    // Initialize weeks with generated data
    weeks: generateWeeksForYear(),
    ...createCampaignActions(set, get),
    
    // Add saveGlobalPercentages directly in case it's missing from createCampaignActions
    saveGlobalPercentages: (percentages: Record<string, number>) => {
      useGlobalBudgetStore.getState().setWeeklyPercentages(percentages);
    }
  };
});

// Setup the client store subscription
setupClientSubscription();
