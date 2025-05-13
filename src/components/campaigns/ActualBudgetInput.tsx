
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface ActualBudgetInputProps {
  campaignId: string;
  weekLabel: string;
  plannedBudget: number;
}

export function ActualBudgetInput({ campaignId, weekLabel, plannedBudget }: ActualBudgetInputProps) {
  const [actualBudget, setActualBudget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Calculate variance
  const variance = actualBudget !== null ? actualBudget - plannedBudget : 0;
  const hasVariance = actualBudget !== null && variance !== 0;
  
  // Get actual budget from the database
  useEffect(() => {
    async function fetchActualBudget() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('actual_budgets')
          .select('amount')
          .eq('campaign_id', campaignId)
          .eq('week_label', weekLabel)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // No rows found
            console.error('Error fetching actual budget:', error);
          }
          return;
        }
        
        if (data) {
          setActualBudget(data.amount);
          setInputValue(data.amount.toString());
        }
      } catch (error) {
        console.error('Error fetching actual budget:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchActualBudget();
  }, [campaignId, weekLabel]);
  
  // Update actual budget
  const updateActualBudget = async (value: number) => {
    setIsLoading(true);
    try {
      // Check if we already have an entry for this campaign and week
      const { data, error: checkError } = await supabase
        .from('actual_budgets')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('week_label', weekLabel)
        .single();
      
      let error;
      
      if (checkError && checkError.code === 'PGRST116') {
        // No entry found, create a new one
        const { error: insertError } = await supabase
          .from('actual_budgets')
          .insert({
            campaign_id: campaignId,
            week_label: weekLabel,
            amount: value
          });
        error = insertError;
      } else {
        // Entry found, update it
        const { error: updateError } = await supabase
          .from('actual_budgets')
          .update({ amount: value })
          .eq('campaign_id', campaignId)
          .eq('week_label', weekLabel);
        error = updateError;
      }
      
      if (error) {
        throw error;
      }
      
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
  );
}
