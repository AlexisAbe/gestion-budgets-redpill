
import React, { useState, useEffect } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { formatCurrency } from '@/utils/budgetUtils';

interface WeeklyBudgetInputProps {
  campaignId: string;
  weekLabel: string;
  plannedBudget: number;
}

export function WeeklyBudgetInput({ campaignId, weekLabel, plannedBudget }: WeeklyBudgetInputProps) {
  const { updateWeeklyBudget } = useCampaignStore();
  const [inputValue, setInputValue] = useState(plannedBudget ? plannedBudget.toString() : '');
  const [isEditing, setIsEditing] = useState(false);
  const [showFormatted, setShowFormatted] = useState(true);

  useEffect(() => {
    setInputValue(plannedBudget ? plannedBudget.toString() : '');
  }, [plannedBudget]);

  const handleFocus = () => {
    setIsEditing(true);
    setShowFormatted(false);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setShowFormatted(true);

    // Parse and update the value
    const newValue = parseFloat(inputValue) || 0;
    
    if (newValue !== plannedBudget) {
      updateWeeklyBudget(campaignId, weekLabel, newValue);
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

  return (
    <div className="budget-cell relative group">
      {showFormatted && plannedBudget > 0 ? (
        <div 
          onClick={() => setIsEditing(true)}
          className="w-full h-full p-1 cursor-pointer text-center flex items-center justify-center hover:bg-primary/5 rounded"
        >
          {formatCurrency(plannedBudget)}
        </div>
      ) : (
        <input
          type="number"
          min="0"
          className="budget-cell-input"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus={isEditing}
        />
      )}
    </div>
  );
}
