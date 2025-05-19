
import { create } from 'zustand';
import { AdSetState } from './types';
import { createFetchAdSetsSlice, FetchAdSetsSlice } from './actions/fetchActions';
import { createMutationAdSetsSlice, MutationAdSetsSlice } from './actions/mutationActions';
import { createBudgetAdSetsSlice, BudgetAdSetsSlice } from './actions/budgetActions';

// Create the store with all slices
const useAdSetStoreBase = create<AdSetState>()((...args) => ({
  adSets: {},
  ...createFetchAdSetsSlice(...args),
  ...createMutationAdSetsSlice(...args),
  ...createBudgetAdSetsSlice(...args)
}));

export { useAdSetStoreBase };
