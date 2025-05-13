
import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CampaignHeader } from '@/components/dashboard/CampaignHeader';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { ChannelBudgetSummary } from '@/components/dashboard/ChannelBudgetSummary';
import { Toaster } from '@/components/ui/sonner';
import { useCampaignStore } from '@/store/campaignStore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { fetchCampaigns, campaigns, isLoading } = useCampaignStore();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <MainLayout>
      <Toaster position="top-right" />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Chargement des campagnes...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <CampaignHeader />
          
          {/* Add the Channel Budget Summary */}
          <ChannelBudgetSummary campaigns={campaigns} />
          
          <CampaignTable />
        </div>
      )}
    </MainLayout>
  );
};

export default Index;
