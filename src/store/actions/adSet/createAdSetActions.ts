
import { AdSetState, initialAdSetState } from '../../types/adSetStoreTypes';
import { createFetchAdSetActions } from './fetchAdSetActions';
import { createAdSetMutationActions } from './adSetMutationActions';
import { createBudgetActions } from './budgetActions';

export const createAdSetActions = (set: any, get: () => AdSetState) => {
  return {
    ...createFetchAdSetActions(set, get),
    ...createAdSetMutationActions(set, get),
    ...createBudgetActions(set, get),
  };
};
