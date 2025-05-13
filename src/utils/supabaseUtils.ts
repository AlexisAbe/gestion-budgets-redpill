
import { Campaign, MediaChannel, MarketingObjective } from "@/types/campaign";
import { Json } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from 'uuid';

type SupabaseCampaign = {
  id: string;
  media_channel: string;
  name: string;
  objective: string;
  target_audience: string;
  start_date: string;
  total_budget: number;
  duration_days: number;
  weekly_budgets: Json;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export function mapToCampaign(supabaseCampaign: SupabaseCampaign): Campaign {
  return {
    id: supabaseCampaign.id,
    mediaChannel: supabaseCampaign.media_channel as MediaChannel,
    name: supabaseCampaign.name,
    objective: supabaseCampaign.objective as MarketingObjective,
    targetAudience: supabaseCampaign.target_audience,
    startDate: supabaseCampaign.start_date,
    totalBudget: supabaseCampaign.total_budget,
    durationDays: supabaseCampaign.duration_days,
    weeklyBudgets: supabaseCampaign.weekly_budgets as Record<string, number>,
    createdAt: supabaseCampaign.created_at,
    updatedAt: supabaseCampaign.updated_at
  };
}

export function mapToSupabaseCampaign(campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">): Omit<SupabaseCampaign, "id" | "created_at" | "updated_at" | "created_by"> {
  return {
    media_channel: campaign.mediaChannel,
    name: campaign.name,
    objective: campaign.objective,
    target_audience: campaign.targetAudience,
    start_date: campaign.startDate,
    total_budget: campaign.totalBudget,
    duration_days: campaign.durationDays,
    weekly_budgets: campaign.weeklyBudgets
  };
}

// Helper function to validate/generate UUID
export function getValidUUID(possibleUUID: string | null | undefined): string {
  // Check if it's already a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (possibleUUID && uuidRegex.test(possibleUUID)) {
    return possibleUUID;
  }
  
  // Generate a new UUID if invalid
  return uuidv4();
}
