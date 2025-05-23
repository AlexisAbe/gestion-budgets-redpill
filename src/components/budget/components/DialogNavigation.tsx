
import React from 'react';
import { Button } from '@/components/ui/button';

interface DialogNavigationProps {
  currentView: 'edit' | 'manage' | 'apply';
  onViewChange: (view: 'edit' | 'manage' | 'apply') => void;
}

export function DialogNavigation({ currentView, onViewChange }: DialogNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant={currentView === 'edit' ? 'default' : 'outline'} 
        onClick={() => onViewChange('edit')}
      >
        Éditer les pourcentages
      </Button>
      <Button 
        variant={currentView === 'manage' ? 'default' : 'outline'} 
        onClick={() => onViewChange('manage')}
      >
        Gérer les configurations
      </Button>
      <Button 
        variant={currentView === 'apply' ? 'default' : 'outline'} 
        onClick={() => onViewChange('apply')}
      >
        Appliquer aux campagnes
      </Button>
    </div>
  );
}
