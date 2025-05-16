
import React, { useEffect, useState, useCallback } from 'react';
import { useAdSetStore } from '@/store/adSetStore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AdSetForm } from './AdSetForm';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Campaign, AdSet } from '@/types/campaign';
import { toast } from 'sonner';

interface AdSetManagerProps {
  campaign: Campaign;
  onClose: () => void;
  open: boolean;
}

export function AdSetManager({ campaign, onClose, open }: AdSetManagerProps) {
  const { adSets, fetchAdSets, addAdSet, updateAdSet, deleteAdSet } = useAdSetStore();
  const [loading, setLoading] = useState(true);
  
  // Utiliser useCallback pour éviter les re-renders inutiles
  const loadAdSets = useCallback(async () => {
    if (!open) return;
    
    setLoading(true);
    try {
      await fetchAdSets(campaign.id);
    } finally {
      setLoading(false);
    }
  }, [fetchAdSets, campaign.id, open]);
  
  useEffect(() => {
    let isMounted = true;
    
    if (open) {
      loadAdSets().then(() => {
        if (!isMounted) return;
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [loadAdSets, open]);
  
  const handleSaveAdSets = async (newAdSets: Array<Omit<AdSet, "id" | "createdAt" | "updatedAt">>) => {
    setLoading(true);
    try {
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
      
      // Process deletions, updates, and additions in batches
      const deletePromises = currentAdSets
        .filter(adSet => !idsToKeep.has(adSet.id))
        .map(adSet => deleteAdSet(String(adSet.id), adSet.name));
      
      await Promise.all(deletePromises);
      
      for (const adSet of newAdSets) {
        if ('id' in adSet && adSet.id) {
          // Update existing ad set - ensure id is a string
          await updateAdSet(String(adSet.id), adSet as Partial<AdSet>);
        } else {
          // Add new ad set
          await addAdSet({
            ...adSet,
            campaignId: campaign.id
          });
        }
      }
      
      toast.success(`Les sous-ensembles de "${campaign.name}" ont été mis à jour`);
      
      // Refresh the list after changes
      await fetchAdSets(campaign.id);
    } catch (error) {
      console.error('Error saving ad sets:', error);
      toast.error("Une erreur est survenue lors de l'enregistrement des sous-ensembles");
    } finally {
      setLoading(false);
    }
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
