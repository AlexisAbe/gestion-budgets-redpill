
import { CampaignState } from '../../types';
import { createUpdateWeeklyBudgetSlice } from './updateWeeklyBudgetSlice';
import { createUpdateActualBudgetSlice } from './updateActualBudgetSlice';
import { createAutoDistributeBudgetSlice } from './autoDistributeBudgetSlice';

export const createBudgetSlices = (set: any, get: () => CampaignState) => ({
  ...createUpdateWeeklyBudgetSlice(set),
  ...createUpdateActualBudgetSlice(set),
  ...createAutoDistributeBudgetSlice(set, get),
});
