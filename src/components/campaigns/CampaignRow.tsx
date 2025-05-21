import React, { useState, useEffect, useMemo } from 'react';
import { Campaign, WeeklyView, AdSet } from '@/types/campaign';
import { useCampaignStore } from '@/store/campaignStore';
import { useAdSetStore } from '@/store/adSetStore';
import { getCampaignWeeks } from '@/utils/dateUtils';
import { AdSetManager } from '@/components/adSets/AdSetManager';
import { AdSetDetails } from '@/components/adSets/AdSetDetails';
import { BudgetChart } from '@/components/charts/BudgetChart';
import { BudgetDistributionModal } from '@/components/ui/BudgetDistributionModal';
import { CampaignHeader } from './CampaignHeader';
import { CampaignActions } from './CampaignActions';
import { InlineAdSets } from './InlineAdSets';
import { getMediaChannelClass, getObjectiveClass } from './campaignStyles';
import { calculateTotalAdSetsActualBudget } from '@/utils/budget/calculations';
import { EditCampaignForm } from './EditCampaignForm';

interface CampaignRowProps {
  campaign: Campaign;
  weeks: WeeklyView[];
  onToggleChart: (campaignId: string) => void;
  showChart: boolean;
  showInlineAdSets: boolean;
  onToggleInlineAdSets: (campaignId: string) => void;
}

export function CampaignRow({ 
  campaign, 
  weeks, 
  onToggleChart, 
  showChart, 
  showInlineAdSets, 
  onToggleInlineAdSets 
}: CampaignRowProps) {
  const { deleteCampaign } = useCampaignStore();
  const { adSets, fetchAdSets, isLoading } = useAdSetStore();
  const [isDistributionOpen, setIsDistributionOpen] = useState(false);
  const [isAdSetManagerOpen, setIsAdSetManagerOpen] = useState(false);
  const [showAdSets, setShowAdSets] = useState(false);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Fetch ad sets only when inline display is enabled and we haven't loaded them yet
  useEffect(() => {
    const campaignAdSets = adSets[campaign.id];
    const shouldFetch = (showInlineAdSets || showAdSets) && 
                       !isLoading && 
                       (!campaignAdSets || campaignAdSets.length === 0) && 
                       !hasTriedFetching;
                       
    if (shouldFetch) {
      setHasTriedFetching(true);
      fetchAdSets(campaign.id);
    }
  }, [showInlineAdSets, showAdSets, campaign.id, fetchAdSets, adSets, isLoading, hasTriedFetching]);
  
  // Get campaign weeks (which weeks this campaign runs in)
  const campaignWeeks = getCampaignWeeks(campaign.startDate, campaign.durationDays, weeks);
  
  // Get campaign ad sets
  const campaignAdSets = adSets[campaign.id] || [];
  
  // Calculate total actual budget for ad sets
  const totalAdSetsActualBudget = useMemo(() => {
    return calculateTotalAdSetsActualBudget(campaignAdSets);
  }, [campaignAdSets]);

  const handleToggleChart = () => {
    onToggleChart(campaign.id);
  };

  const handleToggleInlineAdSets = () => {
    onToggleInlineAdSets(campaign.id);
  };

  const handleToggleAdSets = () => {
    setShowAdSets(!showAdSets);
  };

  const handleOpenDistribution = () => {
    setIsDistributionOpen(true);
  };

  const handleOpenAdSetManager = () => {
    setIsAdSetManagerOpen(true);
  };

  const handleEditCampaign = () => {
    setIsEditOpen(true);
  };

  const handleDeleteCampaign = () => {
    deleteCampaign(campaign.id);
  };

  return (
    <>
      <tr className="hover:bg-muted/20">
        <CampaignHeader 
          campaign={campaign}
          weeks={weeks}
          campaignWeeks={campaignWeeks}
          getMediaChannelClass={getMediaChannelClass}
          getObjectiveClass={getObjectiveClass}
          totalAdSetsActualBudget={totalAdSetsActualBudget}
          adSets={campaignAdSets}
          onOpenDistribution={handleOpenDistribution}
          onOpenAdSetManager={handleOpenAdSetManager}
          onToggleAdSets={handleToggleAdSets}
          onToggleChart={handleToggleChart}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
          showAdSets={showAdSets}
          showInlineAdSets={showInlineAdSets}
          onToggleInlineAdSets={handleToggleInlineAdSets}
        />
        {/* Garder les actions dans la dernière cellule également pour la compatibilité */}
        <td className="px-3 py-2 align-middle">
          <CampaignActions 
            campaignId={campaign.id}
            campaignName={campaign.name}
            showChart={showChart}
            showInlineAdSets={showInlineAdSets}
            onToggleChart={onToggleChart}
            onToggleInlineAdSets={onToggleInlineAdSets}
            onDeleteCampaign={deleteCampaign}
            onOpenDistribution={handleOpenDistribution}
            onOpenAdSetManager={handleOpenAdSetManager}
            onToggleAdSets={handleToggleAdSets}
            showAdSets={showAdSets}
          />
        </td>
      </tr>
      
      {/* Inline AdSets rows */}
      {showInlineAdSets && (
        <InlineAdSets 
          campaign={campaign}
          adSets={campaignAdSets}
          weeks={weeks}
          campaignWeeks={campaignWeeks}
          isLoading={isLoading && hasTriedFetching}
        />
      )}

      {/* AdSet details row (full width details) */}
      {showAdSets && (
        <tr>
          <td colSpan={8 + weeks.length} className="bg-muted/10 p-4">
            <AdSetDetails campaign={campaign} />
          </td>
        </tr>
      )}

      {/* Chart row */}
      {showChart && (
        <tr>
          <td colSpan={8 + weeks.length} className="bg-muted/20 p-4">
            <BudgetChart campaign={campaign} weeks={weeks} />
          </td>
        </tr>
      )}
      
      <BudgetDistributionModal 
        open={isDistributionOpen}
        onClose={() => setIsDistributionOpen(false)}
        campaign={campaign}
      />

      {isAdSetManagerOpen && (
        <AdSetManager
          campaign={campaign}
          open={isAdSetManagerOpen}
          onClose={() => setIsAdSetManagerOpen(false)}
        />
      )}

      {/* Add EditCampaignForm */}
      <EditCampaignForm
        campaign={campaign}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
