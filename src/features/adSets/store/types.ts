
import { AdSet } from '@/types/campaign';

export interface AdSetState {
  adSets: Record<string, AdSet[]>;
  isLoading: boolean;
  error: string | null;
  fetchAdSets: (campaignId: string) => Promise<AdSet[]>;
  addAdSet: (adSetData: Omit<AdSet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AdSet | null>;
  updateAdSet: (adSetId: string, updates: Partial<AdSet>) => Promise<boolean>;
  deleteAdSet: (adSetId: string, name: string, campaignId: string) => Promise<boolean>;
  updateAdSetActualBudget: (adSetId: string, weekLabel: string, amount: number) => void;
}
