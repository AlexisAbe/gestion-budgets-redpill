
import { create } from 'zustand';
import { CampaignState, initialCampaignState, GlobalPercentageSettings } from './types';
import { createFetchSlice } from './slices/fetchSlice';
import { createMutationSlice } from './slices/mutationSlice';
import { createBudgetSlice } from './slices/budgetSlice';
import { createGlobalPercentagesSlice } from './slices/globalPercentagesSlice';
import { generateWeeksForYear } from '@/utils/dateUtils';

// Create the campaign store with modular slices
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
    // Add slices
    ...createFetchSlice(set, get),
    ...createMutationSlice(set, get),
    ...createBudgetSlice(set, get),
    ...createGlobalPercentagesSlice(set),
    
    // Reset store action - kept here since it's simple
    resetStore: () => {
      set(initialCampaignState);
    },
  };
});
