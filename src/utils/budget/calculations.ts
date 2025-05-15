
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
