
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

// Helper to format Supabase error messages for better user feedback
export function formatSupabaseError(error: any): string {
  if (!error) return 'Une erreur inconnue est survenue';
  
  // Check for common Supabase error patterns
  if (error.code === 'PGRST301') {
    return 'Erreur d\'authentification avec la base de données';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Session expirée ou invalide';
  }
  
  // PostgreSQL constraint violations
  if (error.code === '23505') {
    return 'Cette entrée existe déjà';
  }
  
  if (error.code === '23503') {
    return 'Référence invalide à une autre table';
  }
  
  // Return the original message if we can't format it
  return error.message || error.toString();
}
