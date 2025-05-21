
import { create } from 'zustand';
import { AdSetState } from './types';
import { createFetchAdSetsSlice } from './slices/fetchSlice';
import { createMutationAdSetsSlice } from './slices/mutationSlice';
import { createBudgetAdSetsSlice } from './slices/budgetSlice';

// Create the store with all slices
const useAdSetStore = create<AdSetState>()((set, get) => ({
  adSets: {},
  isLoading: false,
  error: null,
  fetchingCampaigns: new Set(),
  ...createFetchAdSetsSlice(set, get),
  ...createMutationAdSetsSlice(set, get),
  ...createBudgetAdSetsSlice(set, get)
}));

export { useAdSetStore };
