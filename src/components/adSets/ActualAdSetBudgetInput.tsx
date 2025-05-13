
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/budgetUtils';
import { useCampaignStore } from '@/store/campaignStore';
import { useAdSetStore } from '@/store/adSetStore';
import { Input } from '@/components/ui/input';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ActualAdSetBudgetInputProps {
  campaignId: string;
  adSetId: string;
  weekLabel: string;
  adSetPercentage: number;
  plannedBudget: number;
  actualCampaignBudget?: number;
}

export function ActualAdSetBudgetInput({
  campaignId,
  adSetId,
  weekLabel,
  adSetPercentage,
  plannedBudget,
  actualCampaignBudget
}: ActualAdSetBudgetInputProps) {
  const { updateCampaign, campaigns } = useCampaignStore();
  const { adSets, fetchAdSets } = useAdSetStore();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [actualBudget, setActualBudget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate the ad set's actual budget based on campaign's actual budget and ad set percentage
  useEffect(() => {
    if (actualCampaignBudget !== undefined) {
      const adSetActualBudget = actualCampaignBudget * (adSetPercentage / 100);
      setActualBudget(adSetActualBudget);
      setInputValue(adSetActualBudget.toString());
    } else {
      setActualBudget(null);
      setInputValue('');
    }
  }, [actualCampaignBudget, adSetPercentage]);

  // Calculate variance between planned and actual
  const variance = actualBudget !== null ? actualBudget - plannedBudget : 0;
  const hasVariance = actualBudget !== null && Math.abs(variance) > 1; // Account for small rounding errors

  // Update actual budget
  const handleUpdateActualBudget = async () => {
    if (inputValue.trim() === '') {
      setIsEditing(false);
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      toast.error('Veuillez entrer un nombre valide');
      return;
    }

    setIsLoading(true);
    try {
      // Get the current campaign
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Calculate what percentage of the actual budget this ad set's actual budget represents
      const calculatedActualBudget = value / (adSetPercentage / 100);
      
      // Update the campaign's actual budgets
      const updatedActualBudgets = { 
        ...(campaign.actualBudgets || {}),
        [weekLabel]: calculatedActualBudget
      };
      
      // Update the campaign
      await updateCampaign(campaignId, {
        actualBudgets: updatedActualBudgets
      });

      // Refresh ad sets to get updated data
      await fetchAdSets(campaignId);
      
      setActualBudget(value);
      toast.success(`Budget réel mis à jour: ${formatCurrency(value)}`);
    } catch (error) {
      console.error('Error updating actual budget:', error);
      toast.error('Erreur lors de la mise à jour du budget réel');
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdateActualBudget();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(actualBudget?.toString() || '');
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center">
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleUpdateActualBudget}
          autoFocus
          className="h-7 w-24 text-right text-xs"
          disabled={isLoading}
          placeholder="Budget réel"
        />
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer px-1 py-0.5 text-xs group rounded hover:bg-muted/30"
      onClick={() => setIsEditing(true)}
    >
      {isLoading ? (
        <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
      ) : actualBudget !== null ? (
        <div className="flex items-center justify-between">
          <span className={`${hasVariance ? (variance > 0 ? 'text-red-500' : 'text-green-500') : ''}`}>
            {formatCurrency(actualBudget)}
          </span>
          
          {hasVariance && (
            <div className="flex items-center ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              {variance > 0 ? (
                <ArrowUpIcon className="h-3 w-3 text-red-500" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 text-green-500" />
              )}
            </div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground opacity-50 group-hover:opacity-100 text-xs italic">
          + Réel
        </span>
      )}
    </div>
  );
}
