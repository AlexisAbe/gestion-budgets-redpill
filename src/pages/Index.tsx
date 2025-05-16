// src/pages/Index.tsx

import React, { useEffect, Suspense, lazy } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Toaster } from '@/components/ui/sonner';
import { useCampaignStore } from '@/store/campaignStore';
import { useClientStore } from '@/store/clientStore';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Lazy load components
const CampaignHeader = lazy(() =>
  import('@/components/dashboard/header').then((m) => ({ default: m.CampaignHeader }))
);
const ChannelBudgetSummary = lazy(() =>
  import('@/components/dashboard/ChannelBudgetSummary').then((m) => ({
    default: m.ChannelBudgetSummary,
  }))
);
const CampaignTable = lazy(() =>
  import('@/components/campaigns/CampaignTable').then((m) => ({
    default: m.CampaignTable,
  }))
);

// Loader générique
const ComponentLoader = () => (
  <div className="flex items-center justify-center h-[20vh]">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const Index: React.FC = () => {
  const { fetchCampaigns, filteredCampaigns, isLoading } = useCampaignStore();
  const { selectedClientId, clients } = useClientStore();
  
  const currentClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId) || null
    : null;

  useEffect(() => {
    if (selectedClientId) {
      fetchCampaigns();
    }
  }, [fetchCampaigns, selectedClientId]);

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="max-w-full overflow-x-hidden p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">
              Chargement des campagnes...
            </p>
          </div>
        ) : (
          <>
            {currentClient && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold">{currentClient.name}</h1>
                <p className="text-muted-foreground">
                  Plateforme de gestion de budget média
                </p>
              </div>
            )}

            {/* Tout ce qui suit peut lever, on intercepte */}
            <ErrorBoundary>
              <Suspense fallback={<ComponentLoader />}>
                <CampaignHeader />
              </Suspense>

              <Suspense fallback={<ComponentLoader />}>
                <ChannelBudgetSummary campaigns={filteredCampaigns} />
              </Suspense>

              <Suspense fallback={<ComponentLoader />}>
                <CampaignTable campaigns={filteredCampaigns} />
              </Suspense>
            </ErrorBoundary>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
