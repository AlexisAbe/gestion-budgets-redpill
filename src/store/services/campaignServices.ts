
// This file is maintained for backward compatibility
// It re-exports all campaign services from the new modular structure

export {
  fetchCampaignsService,
  addCampaignService,
  updateCampaignService,
  deleteCampaignService,
  updateWeeklyBudgetService,
  autoDistributeBudgetService,
  resetStoreService
} from './campaign';
