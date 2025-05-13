
import { Campaign, MediaChannel, MarketingObjective } from "@/types/campaign";
import { Json } from "@/integrations/supabase/types";

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
