
import React from 'react';
import { Campaign, WeeklyView } from '@/types/campaign';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCampaignWeeks } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/budgetUtils';
import { AdSetDetails } from '@/components/adSets/AdSetDetails';

interface BudgetChartProps {
  campaign: Campaign;
  weeks: WeeklyView[];
}

export function BudgetChart({ campaign, weeks }: BudgetChartProps) {
  // Get campaign weeks (which weeks this campaign runs in)
  const campaignWeekNumbers = getCampaignWeeks(campaign.startDate, campaign.durationDays, weeks);
  
  // Filter to only weeks within the campaign duration AND in the visible weeks array
  const campaignWeeksData = weeks
    .filter(week => campaignWeekNumbers.includes(week.weekNumber))
    .map(week => {
      const weekLabel = week.weekLabel;
      return {
        name: weekLabel,
        budget: campaign.weeklyBudgets[weekLabel] || 0,
        // We can add actual budget here when that's implemented
      };
    });
  
  // Calculate total allocated budget
  const totalAllocated = Object.values(campaign.weeklyBudgets).reduce((sum, budget) => sum + budget, 0);
  const unallocatedBudget = campaign.totalBudget - totalAllocated;
  const percentageAllocated = (totalAllocated / campaign.totalBudget) * 100;
  
  return (
    <div className="space-y-4 p-2">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Budget Distribution</h3>
              <div className="text-sm">
                <span className="font-semibold">{formatCurrency(totalAllocated)}</span> of <span className="font-semibold">{formatCurrency(campaign.totalBudget)}</span> allocated
                <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                  {percentageAllocated.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {unallocatedBudget > 0 && (
              <div className="p-2 mb-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
                Unallocated budget: <span className="font-semibold">{formatCurrency(unallocatedBudget)}</span>
              </div>
            )}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignWeeksData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="budget" name="Planned Budget" fill="#10b981" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="md:w-1/3 lg:w-1/4 xl:w-1/3">
          <AdSetDetails campaign={campaign} />
        </div>
      </div>
    </div>
  );
}
