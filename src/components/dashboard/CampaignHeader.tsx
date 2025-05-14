
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignStore } from '@/store/campaignStore';
import { formatCurrency } from '@/utils/budgetUtils';
import { BarChart3, CheckSquare, AlertTriangle, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CampaignHeader() {
  // Use filteredCampaigns (which are already filtered by client) instead of all campaigns
  const { filteredCampaigns } = useCampaignStore();
  
  // Calculate total budget for the selected client's campaigns
  const totalBudget = filteredCampaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);
  
  // Calculate allocated budget for the selected client's campaigns
  const allocatedBudget = filteredCampaigns.reduce((sum, campaign) => {
    return sum + Object.values(campaign.weeklyBudgets).reduce((weekSum, budget) => weekSum + (budget || 0), 0);
  }, 0);
  
  // Calculate percentage allocated
  const percentageAllocated = totalBudget > 0 ? (allocatedBudget / totalBudget) * 100 : 0;
  
  // Count campaigns with balanced budget for the selected client
  const balancedCampaigns = filteredCampaigns.filter(campaign => {
    const weeklySum = Object.values(campaign.weeklyBudgets).reduce((sum, budget) => sum + (budget || 0), 0);
    return Math.abs(weeklySum - campaign.totalBudget) < 0.01;
  }).length;
  
  // Count campaigns with unbalanced budget for the selected client
  const unbalancedCampaigns = filteredCampaigns.length - balancedCampaigns;

  return (
    <div className="w-full mb-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aperçu des Campagnes</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <BarChart3 className="mr-2 h-4 w-4" />
            Voir en Graphique
          </Button>
          <Button variant="outline" className="hidden sm:flex">
            <BarChart2 className="mr-2 h-4 w-4" />
            Voir en Calendrier
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Réparti sur {filteredCampaigns.length} campagne{filteredCampaigns.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Alloué</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(allocatedBudget)}</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div
                className={`h-1.5 rounded-full ${
                  percentageAllocated < 90 ? 'bg-yellow-400' : 'bg-green-500'
                }`}
                style={{ width: `${percentageAllocated}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {percentageAllocated.toFixed(1)}% du budget total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campagnes Équilibrées</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balancedCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {balancedCampaigns > 0 && filteredCampaigns.length > 0 
                ? `${((balancedCampaigns / filteredCampaigns.length) * 100).toFixed(1)}% des campagnes`
                : 'Pas de campagnes'}
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
              {unbalancedCampaigns > 0 
                ? `Campagnes nécessitant attention`
                : 'Toutes les campagnes sont équilibrées'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
