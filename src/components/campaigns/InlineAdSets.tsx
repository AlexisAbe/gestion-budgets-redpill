
import React, { useMemo } from 'react';
import { AdSet, Campaign } from '@/types/campaign';
import { WeeklyView } from '@/types/campaign';
import { 
  calculateWeeklyAdSetsActualBudget,
  calculateTotalAdSetsWeeklyBudget
} from '@/utils/budget/calculations';
import { AdSetRow } from './AdSetRow';
import { BudgetSummaryRows } from './BudgetSummaryRows';
import { LoadingAdSets } from './LoadingAdSets';
import { EmptyAdSets } from './EmptyAdSets';

interface InlineAdSetsProps {
  campaign: Campaign;
  adSets: AdSet[];
  weeks: WeeklyView[];
  campaignWeeks: number[];
  isLoading: boolean;
}

export function InlineAdSets({ campaign, adSets, weeks, campaignWeeks, isLoading }: InlineAdSetsProps) {
  // Calculer les totaux des budgets réels par semaine
  const weeklyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weeks.forEach(week => {
      totals[week.weekLabel] = calculateWeeklyAdSetsActualBudget(adSets, week.weekLabel);
    });
    return totals;
  }, [adSets, weeks]);

  // Calculer les totaux des budgets prévus par semaine
  const weeklyPlannedTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weeks.forEach(week => {
      const weekLabel = week.weekLabel;
      const weeklyBudget = campaign.weeklyBudgets[weekLabel] || 0;
      totals[weekLabel] = calculateTotalAdSetsWeeklyBudget(adSets, weeklyBudget);
    });
    return totals;
  }, [adSets, campaign.weeklyBudgets, weeks]);

  if (isLoading) {
    return <LoadingAdSets campaignId={campaign.id} weeks={weeks} />;
  }

  if (!adSets || adSets.length === 0) {
    return <EmptyAdSets campaignId={campaign.id} weeks={weeks} />;
  }

  return (
    <>
      {adSets.map(adSet => (
        <AdSetRow 
          key={adSet.id}
          adSet={adSet}
          campaign={campaign}
          weeks={weeks}
          campaignWeeks={campaignWeeks}
        />
      ))}

      <BudgetSummaryRows 
        campaign={campaign}
        weeks={weeks}
        campaignWeeks={campaignWeeks}
        weeklyPlannedTotals={weeklyPlannedTotals}
        adSets={adSets}
      />
    </>
  );
}
