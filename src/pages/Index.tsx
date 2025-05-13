
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CampaignHeader } from '@/components/dashboard/CampaignHeader';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  return (
    <MainLayout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        <CampaignHeader />
        <CampaignTable />
      </div>
    </MainLayout>
  );
};

export default Index;
