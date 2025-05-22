
import { create } from 'zustand';
import { initialCampaignState, CampaignState } from './types/campaignStoreTypes';
import { createCampaignActions } from './actions/createCampaignActions';
import { setupClientSubscription } from './subscriptions/clientSubscription';
import { generateWeeksForYear } from '@/utils/dateUtils';
import { GlobalPercentageSettings } from './types/campaignStoreTypes';

// Create the campaign store with refactored actions
export const useCampaignStore = create<CampaignState>()((set, get) => {
  // Load global percentages from localStorage if available
  let savedGlobalPercentages: GlobalPercentageSettings | null = null;
  try {
    const savedString = localStorage.getItem('globalBudgetPercentages');
    if (savedString) {
      savedGlobalPercentages = JSON.parse(savedString);
    }
  } catch (e) {
    console.error('Error loading global percentages from localStorage', e);
  }

  return {
    ...initialCampaignState,
    // Initialize weeks with generated data
    weeks: generateWeeksForYear(),
    // Initialize global percentages from localStorage
    globalPercentages: savedGlobalPercentages,
    ...createCampaignActions(set, get),
    // Add saveGlobalPercentages directly to satisfy TypeScript
    saveGlobalPercentages: (percentages: GlobalPercentageSettings): void => {
      // Save to localStorage for persistence
      localStorage.setItem('globalBudgetPercentages', JSON.stringify(percentages));
      
      set((state: CampaignState) => ({
        globalPercentages: percentages
      }));
    }
  };
});

// Setup the client store subscription
setupClientSubscription();
