
import { AdSet } from '@/types/campaign';

export interface AdSetState {
  adSets: Record<string, AdSet[]>; // Keyed by campaign ID
  isLoading: boolean;
  fetchingCampaigns: Set<string>; // Track which campaigns are being fetched
  fetchAdSets: (campaignId: string) => Promise<AdSet[]>;
  addAdSet: (adSet: Omit<AdSet, "id" | "createdAt" | "updatedAt">) => Promise<AdSet | null>;
  updateAdSet: (id: string, updates: Partial<AdSet>) => Promise<AdSet | null>;
  deleteAdSet: (id: string, name: string) => Promise<boolean>;
  validateBudgets: (campaignId: string) => Promise<{ valid: boolean, total: number }>;
  updateActualBudget: (id: string, weekLabel: string, amount: number) => Promise<boolean>;
}
