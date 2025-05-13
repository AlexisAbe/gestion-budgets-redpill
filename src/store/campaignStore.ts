
import { create } from 'zustand';
import { Campaign, MediaChannel, MarketingObjective } from '../types/campaign';
import { generateWeeksForYear, WeeklyView } from '../utils/dateUtils';
import { isBudgetBalanced, distributeEvenlyAcrossWeeks } from '../utils/budgetUtils';
import { toast } from 'sonner';

const YEAR = 2025;

interface CampaignState {
  campaigns: Campaign[];
  weeks: WeeklyView[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  updateWeeklyBudget: (campaignId: string, weekLabel: string, amount: number) => void;
  autoDistributeBudget: (campaignId: string, method: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve') => void;
  resetStore: () => void;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  weeks: generateWeeksForYear(YEAR),
  
  addCampaign: (campaignData) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const campaign: Campaign = {
      id,
      createdAt: now,
      updatedAt: now,
      weeklyBudgets: {},
      ...campaignData
    };
    
    // Auto-distribute budget evenly if no weekly budgets provided
    if (Object.keys(campaign.weeklyBudgets).length === 0) {
      campaign.weeklyBudgets = distributeEvenlyAcrossWeeks(campaign, get().weeks);
    }
    
    // Check if budget is balanced
    const balanced = isBudgetBalanced(campaign);
    
    set(state => ({ campaigns: [...state.campaigns, campaign] }));
    
    console.log(`Campaign "${campaign.name}" added`, campaign);
    
    if (!balanced) {
      toast.warning(`Campaign "${campaign.name}" has unallocated budget. Please check weekly allocations.`);
    } else {
      toast.success(`Campaign "${campaign.name}" added successfully`);
    }
    
    return id;
  },
  
  updateCampaign: (id, data) => {
    set(state => {
      const campaignIndex = state.campaigns.findIndex(c => c.id === id);
      
      if (campaignIndex === -1) {
        console.error(`Campaign with ID ${id} not found`);
        return state;
      }
      
      const updatedCampaign = {
        ...state.campaigns[campaignIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const newCampaigns = [...state.campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      
      console.log(`Campaign "${updatedCampaign.name}" updated:`, data);
      
      // Check if budget is balanced after update
      if ('totalBudget' in data || 'weeklyBudgets' in data) {
        const balanced = isBudgetBalanced(updatedCampaign);
        
        if (!balanced) {
          toast.warning(`Campaign "${updatedCampaign.name}" has unallocated budget. Please check weekly allocations.`);
        }
      }
      
      return { campaigns: newCampaigns };
    });
  },
  
  deleteCampaign: (id) => {
    set(state => {
      const campaignToDelete = state.campaigns.find(c => c.id === id);
      if (!campaignToDelete) return state;
      
      const newCampaigns = state.campaigns.filter(c => c.id !== id);
      
      console.log(`Campaign "${campaignToDelete.name}" deleted`);
      toast.info(`Campaign "${campaignToDelete.name}" deleted`);
      
      return { campaigns: newCampaigns };
    });
  },
  
  updateWeeklyBudget: (campaignId, weekLabel, amount) => {
    set(state => {
      const campaignIndex = state.campaigns.findIndex(c => c.id === campaignId);
      
      if (campaignIndex === -1) {
        console.error(`Campaign with ID ${campaignId} not found`);
        return state;
      }
      
      const campaign = state.campaigns[campaignIndex];
      const newWeeklyBudgets = { ...campaign.weeklyBudgets };
      
      // Update the budget for the specified week
      newWeeklyBudgets[weekLabel] = amount;
      
      const updatedCampaign = {
        ...campaign,
        weeklyBudgets: newWeeklyBudgets,
        updatedAt: new Date().toISOString()
      };
      
      const newCampaigns = [...state.campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      
      console.log(`Weekly budget updated for campaign "${campaign.name}"`, {
        week: weekLabel,
        amount,
        balanced: isBudgetBalanced(updatedCampaign)
      });
      
      return { campaigns: newCampaigns };
    });
  },
  
  autoDistributeBudget: (campaignId, method) => {
    const { campaigns, weeks } = get();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return;
    }
    
    let newWeeklyBudgets: Record<string, number> = {};
    
    // Distribute based on selected method
    if (method === 'even') {
      newWeeklyBudgets = distributeEvenlyAcrossWeeks(campaign, weeks);
    } else {
      const { distributeByCurve } = require('../utils/budgetUtils');
      newWeeklyBudgets = distributeByCurve(campaign, weeks, method);
    }
    
    // Update the campaign
    set(state => {
      const campaignIndex = state.campaigns.findIndex(c => c.id === campaignId);
      const updatedCampaign = {
        ...campaign,
        weeklyBudgets: newWeeklyBudgets,
        updatedAt: new Date().toISOString()
      };
      
      const newCampaigns = [...state.campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      
      console.log(`Budget auto-distributed for campaign "${campaign.name}" using ${method} method`);
      toast.success(`Budget for "${campaign.name}" has been automatically distributed`);
      
      return { campaigns: newCampaigns };
    });
  },
  
  resetStore: () => {
    set({
      campaigns: [],
      weeks: generateWeeksForYear(YEAR)
    });
    
    console.log("Store reset to initial state");
    toast.info("All campaign data has been reset");
  }
}));

// Example data for testing
export function addExampleCampaigns() {
  const store = useCampaignStore.getState();
  const { weeks } = store;
  
  // Facebook Awareness Campaign
  store.addCampaign({
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
  store.addCampaign({
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
  store.addCampaign({
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
  store.addCampaign({
    mediaChannel: "EMAIL" as MediaChannel,
    name: "Loyalty Members Exclusive",
    objective: "loyalty" as MarketingObjective,
    targetAudience: "Existing Belambra Club members",
    startDate: "2025-06-01", // June 1st
    totalBudget: 5000,
    durationDays: 30, // 1 month
    weeklyBudgets: {}
  });
  
  console.log("Example campaigns added");
}
