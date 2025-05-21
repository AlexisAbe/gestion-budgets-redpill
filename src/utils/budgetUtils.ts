
import { Campaign } from "@/types/campaign";

/**
 * Format a currency value to a string with the € symbol
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Calculate the total budget from a campaign's weekly budgets
 */
export function calculateTotalBudget(campaign: Campaign): number {
  if (!campaign.weeklyBudgets) return campaign.totalBudget;
  
  // Only count regular weekly budget keys (not special keys like __actual_budgets__)
  return Object.entries(campaign.weeklyBudgets)
    .filter(([key]) => !key.startsWith('__'))
    .reduce((sum, [_, amount]) => sum + (amount as number), 0);
}

/**
 * Calculate the total actual budget spent from a campaign's actual budgets
 */
export function calculateTotalActualBudget(campaign: Campaign): number {
  if (!campaign.actualBudgets || Object.keys(campaign.actualBudgets).length === 0) {
    return 0;
  }
  
  return Object.values(campaign.actualBudgets).reduce((sum, amount) => sum + (amount as number), 0);
}

/**
 * Check if a campaign's weekly budget allocation matches its total budget
 */
export function isBudgetBalanced(campaign: Campaign): boolean {
  const allocatedBudget = calculateTotalBudget(campaign);
  return Math.abs(allocatedBudget - campaign.totalBudget) < 0.01; // Accounting for floating-point errors
}

/**
 * Calculate the percentage of budget that has been allocated
 */
export function getBudgetAllocationPercentage(campaign: Campaign): number {
  const allocatedBudget = calculateTotalBudget(campaign);
  return campaign.totalBudget > 0 ? (allocatedBudget / campaign.totalBudget) * 100 : 0;
}

/**
 * Get the amount of unallocated budget
 */
export function getUnallocatedBudget(campaign: Campaign): number {
  const allocatedBudget = calculateTotalBudget(campaign);
  return campaign.totalBudget - allocatedBudget;
}

/**
 * Get the week of a date
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000);
  return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Auto-distribute budget evenly across campaign weeks
 * This is needed for the `distributeEvenlyAcrossWeeks` import in addCampaignService.ts
 */
export function distributeEvenlyAcrossWeeks(
  campaign: Campaign, 
  weeks: { weekLabel: string; startDate: string; endDate: string }[]
): Record<string, number> {
  const newWeeklyBudgets: Record<string, number> = {};
  const campaignStart = new Date(campaign.startDate);
  const campaignEnd = new Date(campaign.startDate);
  campaignEnd.setDate(campaignEnd.getDate() + campaign.durationDays - 1);
  
  // Find weeks that overlap with campaign duration
  let relevantWeeks = 0;
  
  for (const week of weeks) {
    const weekStart = new Date(week.startDate);
    const weekEnd = new Date(week.endDate);
    
    // If campaign overlaps with this week
    if ((campaignStart <= weekEnd && campaignEnd >= weekStart)) {
      newWeeklyBudgets[week.weekLabel] = 0; // Initialize
      relevantWeeks++;
    }
  }
  
  // Distribute budget evenly
  if (relevantWeeks > 0) {
    const budgetPerWeek = campaign.totalBudget / relevantWeeks;
    
    for (const weekLabel in newWeeklyBudgets) {
      newWeeklyBudgets[weekLabel] = Number(budgetPerWeek.toFixed(2));
    }
    
    // Adjust rounding errors by adding/subtracting from the first week
    const firstWeekLabel = Object.keys(newWeeklyBudgets)[0];
    if (firstWeekLabel) {
      const totalAllocated = Object.values(newWeeklyBudgets).reduce((sum, budget) => sum + budget, 0);
      const diff = campaign.totalBudget - totalAllocated;
      newWeeklyBudgets[firstWeekLabel] = Number((newWeeklyBudgets[firstWeekLabel] + diff).toFixed(2));
    }
  }
  
  return newWeeklyBudgets;
}
