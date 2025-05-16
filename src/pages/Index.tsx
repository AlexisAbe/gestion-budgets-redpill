
import React, { useEffect, Suspense, lazy } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Toaster } from '@/components/ui/sonner';
import { useCampaignStore } from '@/store/campaignStore';
import { Loader2 } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';

// Lazy load components
const CampaignHeader = lazy(() => import('@/components/dashboard/CampaignHeader').then(module => ({ default: module.CampaignHeader })));
const ChannelBudgetSummary = lazy(() => import('@/components/dashboard/ChannelBudgetSummary').then(module => ({ default: module.ChannelBudgetSummary })));
const CampaignTable = lazy(() => import('@/components/campaigns/CampaignTable').then(module => ({ default: module.CampaignTable })));

// Loading component
const ComponentLoader = () => (
  <div className="flex items-center justify-center h-[20vh]">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const Index = () => {
  const { fetchCampaigns, filteredCampaigns, isLoading } = useCampaignStore();
  const { selectedClientId, clients } = useClientStore();
  
  const currentClient = selectedClientId 
    ? clients.find(client => client.id === selectedClientId) 
    : null;

  useEffect(() => {
    if (selectedClientId) {
      fetchCampaigns();
    }
  }, [fetchCampaigns, selectedClientId]); 

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
            
            <Suspense fallback={<ComponentLoader />}>
              <CampaignHeader />
            </Suspense>
            
            <Suspense fallback={<ComponentLoader />}>
              <ChannelBudgetSummary campaigns={filteredCampaigns} />
            </Suspense>
            
            <Suspense fallback={<ComponentLoader />}>
              <CampaignTable />
            </Suspense>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
