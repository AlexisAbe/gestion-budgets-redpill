
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/budgetUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActualBudgetInputProps {
  campaignId: string;
  weekLabel: string;
  plannedBudget: number;
}

export function ActualBudgetInput({ campaignId, weekLabel, plannedBudget }: ActualBudgetInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [difference, setDifference] = useState(0);

  // Fetch actual budget on mount
  useEffect(() => {
    async function fetchActualBudget() {
      try {
        const { data, error } = await supabase
          .from('actual_budgets')
          .select('amount')
          .eq('campaign_id', campaignId)
          .eq('week_label', weekLabel)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
          throw error;
        }
        
        if (data) {
          setDisplayValue(Number(data.amount));
          setInputValue(data.amount.toString());
          setDifference(Number(data.amount) - plannedBudget);
        }
      } catch (error) {
        console.error('Error fetching actual budget:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchActualBudget();
  }, [campaignId, weekLabel, plannedBudget]);

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    
    // If input is empty or not changed, don't update
    if (!inputValue.trim() || (displayValue !== null && Number(inputValue) === displayValue)) {
      return;
    }
    
    const numericValue = Number(inputValue);
    
    if (isNaN(numericValue)) {
      toast.error("Veuillez entrer un montant valide");
      setInputValue(displayValue?.toString() || '');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('actual_budgets')
        .upsert({
          campaign_id: campaignId,
          week_label: weekLabel,
          amount: numericValue
        }, {
          onConflict: 'campaign_id,week_label'
        });
      
      if (error) throw error;
      
      setDisplayValue(numericValue);
      setDifference(numericValue - plannedBudget);
      toast.success(`Budget réel mis à jour pour la semaine ${weekLabel}`);
    } catch (error) {
      console.error('Error updating actual budget:', error);
      toast.error("Erreur lors de la mise à jour du budget réel");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  if (isLoading) {
    return <div className="actual-budget-cell text-center p-2">-</div>;
  }

  // Calculate status color
  const getDifferenceColor = () => {
    if (difference === 0 || !displayValue) return "text-gray-500";
    if (difference < 0) return "text-green-600"; // Under budget (good)
    return "text-red-600"; // Over budget (bad)
  };

  const getDifferencePrefix = () => {
    if (difference === 0 || !displayValue) return "";
    if (difference < 0) return "-"; // Under budget
    return "+"; // Over budget
  };

  return (
    <div className="actual-budget-cell relative">
      {isEditing ? (
        <input
          type="number"
          className="budget-cell-input"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="w-full h-full p-2 cursor-pointer text-center flex flex-col items-center justify-center hover:bg-primary/5 rounded"
        >
          {displayValue !== null ? (
            <>
              <span>{formatCurrency(displayValue)}</span>
              {plannedBudget > 0 && displayValue > 0 && (
                <span className={`text-xs ${getDifferenceColor()}`}>
                  {getDifferencePrefix()}{formatCurrency(Math.abs(difference))}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400">Ajouter</span>
          )}
        </div>
      )}
    </div>
  );
}
