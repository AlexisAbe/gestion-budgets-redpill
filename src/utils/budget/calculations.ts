
import { Campaign } from "../../types/campaign";

/**
 * Calculate if a campaign's weekly budget sum matches the total budget
 * @returns {boolean} Whether the budget is balanced
 */
export function isBudgetBalanced(campaign: Campaign): boolean {
  const weeklySum = Object.values(campaign.weeklyBudgets).reduce((sum, budget) => sum + (budget || 0), 0);
  return Math.abs(weeklySum - campaign.totalBudget) < 0.01; // Account for floating point errors
}

/**
 * Calculate how much budget is unallocated
 */
export function getUnallocatedBudget(campaign: Campaign): number {
  const weeklySum = Object.values(campaign.weeklyBudgets).reduce((sum, budget) => sum + (budget || 0), 0);
  return campaign.totalBudget - weeklySum;
}

/**
 * Calculate the percentage of budget allocated
 */
export function getBudgetAllocationPercentage(campaign: Campaign): number {
  if (campaign.totalBudget === 0) return 0;
  const weeklySum = Object.values(campaign.weeklyBudgets).reduce((sum, budget) => sum + (budget || 0), 0);
  return (weeklySum / campaign.totalBudget) * 100;
}

/**
 * Calculate the total planned budget from weekly budgets
 */
export function calculateTotalBudget(campaign: { weeklyBudgets: Record<string, number> }): number {
  return Object.values(campaign.weeklyBudgets).reduce((sum, amount) => sum + amount, 0);
}

/**
 * Calculate the total actual budget spent
 */
export function calculateTotalActualBudget(campaign: { actualBudgets?: Record<string, number> }): number {
  if (!campaign.actualBudgets || Object.keys(campaign.actualBudgets).length === 0) {
    return 0;
  }
  return Object.values(campaign.actualBudgets).reduce((sum, amount) => sum + amount, 0);
}

/**
 * Calculate the total actual budget spent across all ad sets for a campaign
 */
export function calculateTotalAdSetsActualBudget(adSets: Array<{
  actualBudgets?: Record<string, number>
}>): number {
  return adSets.reduce((total, adSet) => {
    if (!adSet.actualBudgets) return total;
    return total + Object.values(adSet.actualBudgets).reduce((sum, amount) => sum + amount, 0);
  }, 0);
}

/**
 * Calculate the actual budget spent by ad sets for a specific week
 */
export function calculateWeeklyAdSetsActualBudget(
  adSets: Array<{ actualBudgets?: Record<string, number> }>,
  weekLabel: string
): number {
  return adSets.reduce((total, adSet) => {
    if (!adSet.actualBudgets || !adSet.actualBudgets[weekLabel]) return total;
    return total + adSet.actualBudgets[weekLabel];
  }, 0);
}

/**
 * Calculate weekly budget for ad sets based on campaign weekly budget and ad set percentage
 */
export function calculateAdSetWeeklyBudget(
  campaignWeeklyBudget: number,
  adSetPercentage: number
): number {
  return campaignWeeklyBudget * (adSetPercentage / 100);
}

/**
 * Calculate the total weekly budget for all ad sets in a campaign for a specific week
 */
export function calculateTotalAdSetsWeeklyBudget(
  adSets: Array<{ budgetPercentage: number }>,
  campaignWeeklyBudget: number
): number {
  return adSets.reduce((total, adSet) => {
    const adSetWeeklyBudget = calculateAdSetWeeklyBudget(campaignWeeklyBudget, adSet.budgetPercentage);
    return total + adSetWeeklyBudget;
  }, 0);
}

/**
 * Calculate allocated budget for an array of campaigns
 */
export function calculateAllocatedBudget(campaigns: Campaign[]): number {
  return campaigns.reduce((sum, campaign) => {
    const weeklySum = Object.values(campaign.weeklyBudgets).reduce((total, amount) => total + (amount || 0), 0);
    return sum + weeklySum;
  }, 0);
}

/**
 * Calculate actual spend for campaigns for a specific week
 */
export function calculateActualSpend(campaigns: Campaign[], selectedWeek: string | null): number {
  if (!selectedWeek) return 0;
  
  return campaigns.reduce((sum, campaign) => {
    if (campaign.actualBudgets && campaign.actualBudgets[selectedWeek]) {
      return sum + campaign.actualBudgets[selectedWeek];
    }
    return sum;
  }, 0);
}
