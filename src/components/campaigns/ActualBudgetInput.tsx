
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { updateActualBudgetService } from '@/store/services/campaign/updateCampaignService';
import { useCampaignStore } from '@/store/campaignStore';
import { WeeklyBudgetNote } from '@/components/ui/WeeklyBudgetNote';

interface ActualBudgetInputProps {
  campaignId: string;
  weekLabel: string;
  plannedBudget: number;
  weeklyNote?: string;
}

export function ActualBudgetInput({ 
  campaignId, 
  weekLabel, 
  plannedBudget, 
  weeklyNote 
}: ActualBudgetInputProps) {
  const { campaigns, fetchCampaigns } = useCampaignStore();
  const [actualBudget, setActualBudget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Calculate variance
  const variance = actualBudget !== null ? actualBudget - plannedBudget : 0;
  const hasVariance = actualBudget !== null && variance !== 0;
  
  // Get actual budget from campaign data
  useEffect(() => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign && campaign.actualBudgets && campaign.actualBudgets[weekLabel] !== undefined) {
      setActualBudget(campaign.actualBudgets[weekLabel]);
      setInputValue(campaign.actualBudgets[weekLabel].toString());
    }
  }, [campaignId, weekLabel, campaigns]);
  
  // Update actual budget
  const updateActualBudget = async (value: number) => {
    setIsLoading(true);
    try {
      await updateActualBudgetService(campaignId, weekLabel, value);
      setActualBudget(value);
      await fetchCampaigns(); // Refresh campaigns list to get updated data
      toast.success(`Budget réel mis à jour: ${formatCurrency(value)}`);
    } catch (error) {
      console.error('Error updating actual budget:', error);
      toast.error('Erreur lors de la mise à jour du budget réel');
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle save
  const handleSave = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      toast.error('Veuillez entrer un nombre valide');
      return;
    }
    updateActualBudget(value);
  };
  
  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          className="h-8 w-24 text-right"
          disabled={isLoading}
        />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between">
      <div
        className="cursor-pointer px-2 py-1 group hover:bg-muted rounded"
        onClick={() => {
          setIsEditing(true);
          setInputValue(actualBudget?.toString() || '');
        }}
      >
        {isLoading ? (
          <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
        ) : actualBudget !== null ? (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${hasVariance ? (variance > 0 ? 'text-red-500' : 'text-green-500') : ''}`}>
              {formatCurrency(actualBudget)}
            </span>
            
            {hasVariance && (
              <div className="flex items-center ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {variance > 0 ? (
                  <ArrowUpIcon className="h-3 w-3 text-red-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 text-green-500 mr-1" />
                )}
                <span className={variance > 0 ? 'text-red-500' : 'text-green-500'}>
                  {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm group-hover:text-primary">Click to add</span>
        )}
      </div>
      
      {/* Note button */}
      <WeeklyBudgetNote 
        entityId={campaignId} 
        weekLabel={weekLabel} 
        existingNote={weeklyNote} 
      />
    </div>
  );
}
