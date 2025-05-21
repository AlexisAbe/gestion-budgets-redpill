
import { create } from 'zustand';
import { CampaignState, initialCampaignState } from './types';
import { createFetchSlice } from './slices/fetchSlice';
import { createMutationSlice } from './slices/mutationSlice';
import { createBudgetSlice } from './slices/budgetSlice';
import { generateWeeksForYear } from '@/utils/dateUtils';

// Create the campaign store with modular slices
export const useCampaignStore = create<CampaignState>()((set, get) => {
  return {
    ...initialCampaignState,
    // Initialize weeks with generated data
    weeks: generateWeeksForYear(),
    // Add slices
    ...createFetchSlice(set, get),
    ...createMutationSlice(set, get),
    ...createBudgetSlice(set, get),
    
    // Reset store action - kept here since it's simple
    resetStore: () => {
      set(initialCampaignState);
    },
  };
});
