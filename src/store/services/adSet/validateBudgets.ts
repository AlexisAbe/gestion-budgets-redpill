
import { fetchAdSetsForCampaign } from './fetchAdSets';

export async function validateAdSetBudgets(campaignId: string): Promise<{ valid: boolean, total: number }> {
  try {
    const adSets = await fetchAdSetsForCampaign(campaignId);
    
    const totalPercentage = adSets.reduce((sum, adSet) => sum + adSet.budgetPercentage, 0);
    
    return {
      valid: totalPercentage <= 100,
      total: totalPercentage
    };
  } catch (error) {
    console.error('Error validating ad set budgets:', error);
    return { valid: false, total: 0 };
  }
}
