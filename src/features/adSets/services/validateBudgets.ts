
import { AdSet } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';

export async function validateAdSetBudgets(campaignId: string): Promise<{ valid: boolean, total: number }> {
  try {
    const { data, error } = await supabase
      .from('ad_sets')
      .select('budget_percentage')
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('Error validating ad set budgets:', error);
      return { valid: false, total: 0 };
    }

    const totalPercentage = data.reduce((sum, item) => sum + item.budget_percentage, 0);
    
    // Valid if the total is exactly 100% or there are no ad sets
    const valid = data.length === 0 || Math.abs(totalPercentage - 100) < 0.01;
    
    return {
      valid,
      total: totalPercentage
    };
  } catch (error) {
    console.error('Error in validateAdSetBudgets:', error);
    return { valid: false, total: 0 };
  }
}
