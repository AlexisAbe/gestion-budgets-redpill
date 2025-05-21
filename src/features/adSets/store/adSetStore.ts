
import { create } from 'zustand';
import { AdSetState } from './types';
import { createFetchAdSetsSlice } from './slices/fetchSlice';
import { createMutationAdSetsSlice } from './slices/mutationSlice';
import { createBudgetAdSetsSlice } from './slices/budgetSlice';

// Create the store with all slices
const useAdSetStore = create<AdSetState>()((...args) => ({
  adSets: {},
  ...createFetchAdSetsSlice(...args),
  ...createMutationAdSetsSlice(...args),
  ...createBudgetAdSetsSlice(...args)
}));

export { useAdSetStore };
