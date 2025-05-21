
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { updateWeeklyBudgetService } from '../../services';
import { distributeBudget } from '@/utils/budget/distribution';

/**
 * Applies budget distribution to a single campaign
 */
export const applyCampaignDistribution = async (
  campaign: Campaign,
  weeks: WeeklyView[],
  distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual',
  percentages?: Record<string, number>
): Promise<Record<string, number>> => {
  // Determine which weeks the campaign spans
  const campaignStart = new Date(campaign.startDate);
  const campaignEnd = new Date(campaignStart);
  campaignEnd.setDate(campaignEnd.getDate() + campaign.durationDays);
  
  const relevantWeeks = weeks.filter(week => {
    const weekStart = new Date(week.startDate);
    const weekEnd = new Date(week.endDate);
    return (
      (weekStart <= campaignEnd && weekEnd >= campaignStart) || 
      (weekStart <= campaignStart && weekEnd >= campaignStart)
    );
  }).map(week => week.weekLabel);
  
  // Distribute budget
  const distribution = distributeBudget(
    campaign.totalBudget,
    relevantWeeks,
    distributionStrategy,
    percentages
  );
  
  // Apply updates for each week
  for (const [weekLabel, amount] of Object.entries(distribution)) {
    await updateWeeklyBudgetService(campaign.id, weekLabel, amount);
  }
  
  return distribution;
};
