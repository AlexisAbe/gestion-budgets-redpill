
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

interface BudgetDialogFooterProps {
  isLoading: boolean;
  currentView: 'edit' | 'manage' | 'apply';
  onClose: () => void;
  onSave?: () => void;
  onApply?: () => void;
  totalPercentage?: number;
  selectedCampaigns?: string[];
}

export function BudgetDialogFooter({ 
  isLoading, 
  currentView, 
  onClose, 
  onSave,
  onApply,
  totalPercentage,
  selectedCampaigns
}: BudgetDialogFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Annuler
      </Button>
      {currentView === 'edit' && !isLoading && (
        <Button onClick={onSave} disabled={totalPercentage !== 100}>
          Enregistrer
        </Button>
      )}
      {currentView === 'apply' && !isLoading && (
        <Button 
          onClick={onApply}
          disabled={!selectedCampaigns || selectedCampaigns.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Appliquer
        </Button>
      )}
    </DialogFooter>
  );
}
