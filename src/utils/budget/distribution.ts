
import { Campaign } from "../../types/campaign";
import { WeeklyView } from "../dateUtils";

/**
 * Auto-distribute budget evenly across campaign weeks
 */
export function distributeEvenlyAcrossWeeks(
  campaign: Campaign, 
  weeks: WeeklyView[]
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

/**
 * Auto-distribute budget by curve (front-loaded, back-loaded, or bell curve)
 */
export function distributeByCurve(
  campaign: Campaign,
  weeks: WeeklyView[],
  curveType: 'front-loaded' | 'back-loaded' | 'bell-curve'
): Record<string, number> {
  const newWeeklyBudgets: Record<string, number> = {};
  const relevantWeekLabels: string[] = [];
  const campaignStart = new Date(campaign.startDate);
  const campaignEnd = new Date(campaign.startDate);
  campaignEnd.setDate(campaignEnd.getDate() + campaign.durationDays - 1);
  
  // Find weeks that overlap with campaign duration
  for (const week of weeks) {
    const weekStart = new Date(week.startDate);
    const weekEnd = new Date(week.endDate);
    
    // If campaign overlaps with this week
    if ((campaignStart <= weekEnd && campaignEnd >= weekStart)) {
      relevantWeekLabels.push(week.weekLabel);
      newWeeklyBudgets[week.weekLabel] = 0; // Initialize
    }
  }
  
  if (relevantWeekLabels.length === 0) return newWeeklyBudgets;
  
  const totalWeeks = relevantWeekLabels.length;
  let weights: number[] = [];
  
  // Calculate weights based on curve type
  switch (curveType) {
    case 'front-loaded':
      // More budget at the beginning, tapering off
      for (let i = 0; i < totalWeeks; i++) {
        weights.push(totalWeeks - i);
      }
      break;
    case 'back-loaded':
      // Less budget at the beginning, ramping up
      for (let i = 0; i < totalWeeks; i++) {
        weights.push(i + 1);
      }
      break;
    case 'bell-curve':
      // Peak in the middle
      const mid = Math.floor(totalWeeks / 2);
      for (let i = 0; i < totalWeeks; i++) {
        // Distance from middle determines weight
        weights.push(totalWeeks - Math.abs(i - mid));
      }
      break;
  }
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Distribute budget according to weights
  relevantWeekLabels.forEach((weekLabel, index) => {
    const portion = (weights[index] / totalWeight) * campaign.totalBudget;
    newWeeklyBudgets[weekLabel] = Number(portion.toFixed(2));
  });
  
  // Adjust rounding errors
  const totalAllocated = Object.values(newWeeklyBudgets).reduce((sum, budget) => sum + budget, 0);
  const diff = campaign.totalBudget - totalAllocated;
  
  if (diff !== 0) {
    // Add the difference to the week with the highest budget
    const weekWithMaxBudget = Object.keys(newWeeklyBudgets).reduce((a, b) => 
      newWeeklyBudgets[a] > newWeeklyBudgets[b] ? a : b
    );
    newWeeklyBudgets[weekWithMaxBudget] = Number((newWeeklyBudgets[weekWithMaxBudget] + diff).toFixed(2));
  }
  
  return newWeeklyBudgets;
}

/**
 * Distribute budget by percentage split
 */
export function distributeByPercentages(
  campaign: Campaign,
  percentages: Record<string, number>
): Record<string, number> {
  const newWeeklyBudgets: Record<string, number> = {};
  
  // Check that percentages sum to 100%
  const totalPercentage = Object.values(percentages).reduce((sum, pct) => sum + pct, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    console.error('Percentages do not sum to 100%', totalPercentage);
    return campaign.weeklyBudgets; // Return original if invalid
  }
  
  // Calculate budget for each week
  for (const weekLabel in percentages) {
    const budgetForWeek = (percentages[weekLabel] / 100) * campaign.totalBudget;
    newWeeklyBudgets[weekLabel] = Number(budgetForWeek.toFixed(2));
  }
  
  // Adjust rounding errors
  const totalAllocated = Object.values(newWeeklyBudgets).reduce((sum, budget) => sum + budget, 0);
  const diff = campaign.totalBudget - totalAllocated;
  
  if (diff !== 0) {
    // Add the difference to the week with the highest budget
    const weekWithMaxBudget = Object.keys(newWeeklyBudgets).reduce((a, b) => 
      newWeeklyBudgets[a] > newWeeklyBudgets[b] ? a : b
    );
    newWeeklyBudgets[weekWithMaxBudget] = Number((newWeeklyBudgets[weekWithMaxBudget] + diff).toFixed(2));
  }
  
  return newWeeklyBudgets;
}
