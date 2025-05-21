
import { AdSet } from '@/types/campaign';

export interface AdSetState {
  adSets: Record<string, AdSet[]>;
  isLoading: boolean;
  error: string | null;
  fetchingCampaigns: Set<string>;
  fetchAdSets: (campaignId: string) => Promise<AdSet[]>;
  addAdSet: (adSetData: Omit<AdSet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AdSet | null>;
  updateAdSet: (adSetId: string, updates: Partial<AdSet>) => Promise<boolean>;
  deleteAdSet: (adSetId: string, name: string, campaignId: string) => Promise<boolean>;
  validateBudgets: (campaignId: string) => Promise<{ valid: boolean, total: number }>;
  updateActualBudget: (adSetId: string, weekLabel: string, amount: number) => Promise<boolean>;
  updateAdSetActualBudget: (adSetId: string, weekLabel: string, amount: number) => void;
}
