
import { CampaignState, initialCampaignState } from '../types/campaignStoreTypes';
import { resetStoreService } from '../services/campaign';
import { createFetchCampaignActions } from './fetchCampaignActions';
import { createCampaignMutationActions } from './campaignMutationActions';
import { createBudgetActions } from './budgetActions';

export const createCampaignActions = (set: any, get: () => CampaignState) => {
  return {
    ...createFetchCampaignActions(set, get),
    ...createCampaignMutationActions(set, get),
    ...createBudgetActions(set, get),
    
    // Reset store action - kept here since it's simple
    resetStore: () => {
      resetStoreService();
      set(initialCampaignState);
    },
  };
};
