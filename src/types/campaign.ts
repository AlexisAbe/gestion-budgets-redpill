
export type MarketingObjective = 
  | "awareness" 
  | "consideration" 
  | "conversion" 
  | "loyalty" 
  | "other";

export type MediaChannel = 
  | "META" 
  | "GOOGLE" 
  | "LINKEDIN" 
  | "TWITTER" 
  | "DISPLAY" 
  | "EMAIL" 
  | "OTHER";

export interface Campaign {
  id: string;
  clientId: string; // Add client ID to associate campaigns with clients
  mediaChannel: MediaChannel;
  name: string;
  objective: MarketingObjective;
  targetAudience: string;
  startDate: string; // ISO date string
  totalBudget: number;
  durationDays: number;
  weeklyBudgets: Record<string, number>; // { "W1": 1000, "W2": 2000, ... }
  actualBudgets?: Record<string, number>; // Added this property for actual spent budgets
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyView {
  weekNumber: number; // 1-52
  weekLabel: string; // "S1", "S2", ...
  startDate: string; // ISO date string of first day of week
  endDate: string; // ISO date string of last day of week
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  budgetPercentage: number;
  description?: string;
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
}
