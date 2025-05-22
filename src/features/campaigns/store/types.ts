
import { Campaign, WeeklyView } from '@/types/campaign';

export interface GlobalPercentageSettings {
  weeks: Array<{ weekLabel: string; percentage: number }>;
  lastUpdated: string;
}

export interface CampaignState {
  campaigns: Campaign[];
  filteredCampaigns: Campaign[];
  weeks: WeeklyView[];
  globalPercentages: GlobalPercentageSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Campaign | null>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  updateWeeklyBudget: (campaignId: string, weekLabel: string, amount: number) => Promise<void>;
  updateActualBudget: (campaignId: string, weekLabel: string, amount: number) => Promise<void>;
  autoDistributeBudget: (
    campaignId: string, 
    distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual', 
    percentagesOrApplyGlobally?: Record<string, number> | boolean
  ) => Promise<void>;
  saveGlobalPercentages: (percentages: GlobalPercentageSettings) => void;
  resetStore: () => void;
}

export const initialCampaignState = {
  campaigns: [],
  filteredCampaigns: [],
  globalPercentages: null,
  isLoading: false,
  error: null,
};
