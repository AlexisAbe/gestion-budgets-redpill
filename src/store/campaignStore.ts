
import { create } from 'zustand';
import { Campaign, MediaChannel, MarketingObjective } from '../types/campaign';
import { WeeklyView, generateWeeksForYear } from '../utils/dateUtils';
import { 
  fetchCampaignsService,
  addCampaignService,
  updateCampaignService,
  deleteCampaignService,
  updateWeeklyBudgetService,
  autoDistributeBudgetService,
  resetStoreService
} from './services/campaign';

const YEAR = 2025;

interface CampaignState {
  campaigns: Campaign[];
  weeks: WeeklyView[];
  isLoading: boolean;
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  updateWeeklyBudget: (campaignId: string, weekLabel: string, amount: number) => Promise<void>;
  autoDistributeBudget: (campaignId: string, method: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual', percentages?: Record<string, number>) => Promise<void>;
  resetStore: () => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  weeks: generateWeeksForYear(YEAR),
  isLoading: false,
  
  fetchCampaigns: async () => {
    set({ isLoading: true });
    try {
      const campaigns = await fetchCampaignsService();
      set({ campaigns });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  addCampaign: async (campaignData) => {
    set({ isLoading: true });
    try {
      const newCampaignId = await addCampaignService(campaignData, get().weeks);
      await get().fetchCampaigns(); // Refresh campaigns list
      return newCampaignId;
    } catch (error) {
      console.error('Error adding campaign:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateCampaign: async (id, data) => {
    try {
      const campaign = {
        ...data,
        id
      } as Campaign;
      await updateCampaignService(campaign);
      await get().fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  },
  
  deleteCampaign: async (id) => {
    try {
      const campaignToDelete = get().campaigns.find(c => c.id === id);
      if (!campaignToDelete) return;
      
      await deleteCampaignService(id, campaignToDelete.name);
      set(state => ({ campaigns: state.campaigns.filter(c => c.id !== id) }));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  },
  
  updateWeeklyBudget: async (campaignId, weekLabel, amount) => {
    try {
      await updateWeeklyBudgetService(campaignId, weekLabel, amount);
      await get().fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error('Error updating weekly budget:', error);
    }
  },
  
  autoDistributeBudget: async (campaignId, method, percentages) => {
    try {
      // Pass all required arguments to the service function
      const campaigns = get().campaigns;
      const weeks = get().weeks;
      await autoDistributeBudgetService(campaignId, method, campaigns, weeks, percentages);
      await get().fetchCampaigns(); // Refresh campaigns list
    } catch (error) {
      console.error('Error auto-distributing budget:', error);
    }
  },
  
  resetStore: async () => {
    try {
      await resetStoreService();
      set({
        campaigns: [],
        weeks: generateWeeksForYear(YEAR)
      });
    } catch (error) {
      console.error('Error resetting store:', error);
    }
  }
}));

// Function to add example campaigns (now with Supabase persistence)
export async function addExampleCampaigns() {
  const store = useCampaignStore.getState();
  
  try {
    // Facebook Awareness Campaign
    await store.addCampaign({
      mediaChannel: "META" as MediaChannel,
      name: "Summer Resorts Awareness",
      objective: "awareness" as MarketingObjective,
      targetAudience: "Families with children 5-12",
      startDate: "2025-04-01", // April 1st
      totalBudget: 25000,
      durationDays: 60, // 2 months
      weeklyBudgets: {}
    });
    
    // Google Search Campaign
    await store.addCampaign({
      mediaChannel: "GOOGLE" as MediaChannel,
      name: "Winter Ski Resorts",
      objective: "conversion" as MarketingObjective,
      targetAudience: "Adults 25-45, skiing enthusiasts",
      startDate: "2025-10-15", // October 15th
      totalBudget: 15000,
      durationDays: 90, // 3 months
      weeklyBudgets: {}
    });
    
    // LinkedIn Campaign
    await store.addCampaign({
      mediaChannel: "LINKEDIN" as MediaChannel,
      name: "Corporate Retreats",
      objective: "consideration" as MarketingObjective,
      targetAudience: "HR Managers, Event Planners",
      startDate: "2025-02-01", // February 1st
      totalBudget: 12000,
      durationDays: 45, // 1.5 months
      weeklyBudgets: {}
    });
    
    // Email Campaign
    await store.addCampaign({
      mediaChannel: "EMAIL" as MediaChannel,
      name: "Loyalty Members Exclusive",
      objective: "loyalty" as MarketingObjective,
      targetAudience: "Existing Belambra Club members",
      startDate: "2025-06-01", // June 1st
      totalBudget: 5000,
      durationDays: 30, // 1 month
      weeklyBudgets: {}
    });
    
    console.log("Example campaigns added to Supabase");
  } catch (error) {
    console.error("Error adding example campaigns:", error);
  }
}
