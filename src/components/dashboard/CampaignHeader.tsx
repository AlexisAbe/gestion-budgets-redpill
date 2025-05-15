
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignStore } from '@/store/campaignStore';
import { formatCurrency } from '@/utils/budgetUtils';
import { BarChart3, CheckSquare, AlertTriangle, BarChart2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';

export function CampaignHeader() {
  // Use filteredCampaigns (which are already filtered by client) instead of all campaigns
  const {
    filteredCampaigns,
    weeks
  } = useCampaignStore();

  // State for selected week
  const [selectedWeekLabel, setSelectedWeekLabel] = useState<string | null>(null);
  
  // Find current week based on today's date
  useEffect(() => {
    const today = new Date();
    const currentWeek = weeks.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return today >= startDate && today <= endDate;
    });
    
    if (currentWeek) {
      setSelectedWeekLabel(currentWeek.weekLabel);
    } else if (weeks.length > 0) {
      // If today is not in any week range, default to first week
      setSelectedWeekLabel(weeks[0].weekLabel);
    }
  }, [weeks]);

  // Calculate total planned budget (sum of all campaign totalBudgets)
  const totalPlannedBudget = filteredCampaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);

  // Calculate total actual spent budget (sum of all actual budgets)
  const totalActualSpent = filteredCampaigns.reduce((sum, campaign) => {
    if (campaign.actualBudgets) {
      return sum + Object.values(campaign.actualBudgets).reduce((weekSum, budget) => weekSum + (budget || 0), 0);
    }
    return sum;
  }, 0);

  // Calculate planned and actual budgets for the selected week
  const weeklyPlannedBudget = filteredCampaigns.reduce((sum, campaign) => {
    if (selectedWeekLabel && campaign.weeklyBudgets && campaign.weeklyBudgets[selectedWeekLabel]) {
      return sum + campaign.weeklyBudgets[selectedWeekLabel];
    }
    return sum;
  }, 0);

  const weeklyActualBudget = filteredCampaigns.reduce((sum, campaign) => {
    if (selectedWeekLabel && campaign.actualBudgets && campaign.actualBudgets[selectedWeekLabel]) {
      return sum + campaign.actualBudgets[selectedWeekLabel];
    }
    return sum;
  }, 0);

  // Calculate budget variance for selected week
  const weeklyVariance = weeklyPlannedBudget - weeklyActualBudget;
  const weeklyVariancePercentage = weeklyPlannedBudget > 0 
    ? (weeklyActualBudget / weeklyPlannedBudget) * 100 
    : 0;

  // Calculate percentage of actual spent compared to planned
  const percentageSpent = totalPlannedBudget > 0 ? totalActualSpent / totalPlannedBudget * 100 : 0;

  // Count campaigns with balanced budget for the selected client
  const balancedCampaigns = filteredCampaigns.filter(campaign => {
    const weeklySum = Object.values(campaign.weeklyBudgets).reduce((sum, budget) => sum + (budget || 0), 0);
    return Math.abs(weeklySum - campaign.totalBudget) < 0.01;
  }).length;

  // Count campaigns with unbalanced budget for the selected client
  const unbalancedCampaigns = filteredCampaigns.length - balancedCampaigns;
  
  return <div className="w-full mb-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aperçu des Campagnes</h2>
        <div className="flex items-center gap-2">
          <Select
            value={selectedWeekLabel || ''}
            onValueChange={(value) => setSelectedWeekLabel(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une semaine" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week) => (
                <SelectItem key={week.weekLabel} value={week.weekLabel}>
                  {week.weekLabel} ({new Date(week.startDate).toLocaleDateString('fr-FR')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total Prévu</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlannedBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Réparti sur {filteredCampaigns.length} campagne{filteredCampaigns.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Réel Dépensé</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActualSpent)}</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div className={`h-1.5 rounded-full ${percentageSpent < 90 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{
              width: `${Math.min(percentageSpent, 100)}%`
            }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {percentageSpent.toFixed(1)}% du budget total prévu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Semaine {selectedWeekLabel}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Prévu</p>
                <div className="text-lg font-bold">{formatCurrency(weeklyPlannedBudget)}</div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Dépensé</p>
                <div 
                  className={`text-lg font-bold ${
                    weeklyActualBudget > weeklyPlannedBudget ? 'text-red-500' : 
                    weeklyActualBudget === weeklyPlannedBudget ? '' : 'text-green-500'
                  }`}
                >
                  {formatCurrency(weeklyActualBudget)}
                </div>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div 
                className={`h-1.5 rounded-full ${
                  weeklyActualBudget > weeklyPlannedBudget ? 'bg-red-500' : 
                  weeklyVariancePercentage < 90 ? 'bg-yellow-400' : 'bg-green-500'
                }`} 
                style={{
                  width: `${Math.min(weeklyVariancePercentage, 100)}%`
                }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {weeklyVariancePercentage.toFixed(1)}% du budget prévu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unbalancedCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {unbalancedCampaigns > 0 ? `Campagnes nécessitant attention` : 'Toutes les campagnes sont équilibrées'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>;
}
