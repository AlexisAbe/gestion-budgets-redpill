
import React, { useEffect, useState } from 'react';
import { useAdSetStore } from '@/store/adSetStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { AdSetForm } from './AdSetForm';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Campaign, AdSet } from '@/types/campaign';

interface AdSetManagerProps {
  campaign: Campaign;
  onClose: () => void;
  open: boolean;
}

export function AdSetManager({ campaign, onClose, open }: AdSetManagerProps) {
  const { adSets, isLoading, fetchAdSets, addAdSet, updateAdSet, deleteAdSet } = useAdSetStore();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchAdSets(campaign.id).finally(() => {
        setLoading(false);
      });
    }
  }, [fetchAdSets, campaign.id, open]);
  
  const handleSaveAdSets = async (newAdSets: Array<Omit<AdSet, "id" | "createdAt" | "updatedAt">>) => {
    // Get current ad sets for this campaign
    const currentAdSets = adSets[campaign.id] || [];
    
    // Find ad sets to delete (in current but not in new)
    const idsToKeep = new Set();
    for (const adSet of newAdSets) {
      // For existing ad sets (ones with IDs)
      if ('id' in adSet && adSet.id) {
        idsToKeep.add(adSet.id);
      }
    }
    
    // Delete ad sets that aren't in the new list
    for (const adSet of currentAdSets) {
      if (!idsToKeep.has(adSet.id)) {
        await deleteAdSet(adSet.id, adSet.name);
      }
    }
    
    // Add or update ad sets
    for (const adSet of newAdSets) {
      if ('id' in adSet && adSet.id) {
        // Update existing ad set
        await updateAdSet(adSet.id, adSet as Partial<AdSet>);
      } else {
        // Add new ad set
        await addAdSet({
          ...adSet,
          campaignId: campaign.id
        });
      }
    }
    
    // Refresh the list after changes
    await fetchAdSets(campaign.id);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Sous-ensembles de publicité pour "{campaign.name}"
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AdSetForm
            campaignId={campaign.id}
            campaignBudget={campaign.totalBudget}
            onSave={handleSaveAdSets}
            existingAdSets={adSets[campaign.id] || []}
          />
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
