
import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CampaignHeader } from '@/components/dashboard/CampaignHeader';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { ChannelBudgetSummary } from '@/components/dashboard/ChannelBudgetSummary';
import { Toaster } from '@/components/ui/sonner';
import { useCampaignStore } from '@/store/campaignStore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';
// import { useCampaigns } from '@/features/campaigns/hooks';

const Index = () => {
  // Pour l'instant, on garde l'ancien store, nous ferons la migration complète ultérieurement
  const { fetchCampaigns, filteredCampaigns, isLoading } = useCampaignStore();
  const { selectedClientId, clients } = useClientStore();
  
  const currentClient = selectedClientId 
    ? clients.find(client => client.id === selectedClientId) 
    : null;

  // Pour une migration progressive, on conserve l'ancien système de fetch
  // puis nous passerons à React Query
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns, selectedClientId]); // Refetch when client changes

  return (
    <MainLayout>
      <Toaster position="top-right" />
      <div className="max-w-full overflow-x-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Chargement des campagnes...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {currentClient && (
              <div className="mb-4">
                <h1 className="text-2xl font-bold">{currentClient.name}</h1>
                <p className="text-muted-foreground">Plateforme de gestion de budget média</p>
              </div>
            )}
            
            <CampaignHeader />
            
            <ChannelBudgetSummary campaigns={filteredCampaigns} />
            
            <CampaignTable />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
