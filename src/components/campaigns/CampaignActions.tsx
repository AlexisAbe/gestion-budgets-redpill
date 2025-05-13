
import React, { useState } from 'react';
import { MoreVertical, BarChart, Database, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditCampaignForm } from './EditCampaignForm';
import { useCampaignStore } from '@/store/campaignStore';

interface CampaignActionsProps {
  campaignId: string;
  campaignName: string;
  showChart: boolean;
  showInlineAdSets: boolean;
  onToggleChart: (campaignId: string) => void;
  onToggleInlineAdSets: (campaignId: string) => void;
  onDeleteCampaign: (id: string) => Promise<void>;
  onOpenDistribution: () => void;
  onOpenAdSetManager: () => void;
  onToggleAdSets: () => void;
  showAdSets: boolean;
}

export function CampaignActions({
  campaignId,
  campaignName,
  showChart,
  showInlineAdSets,
  onToggleChart,
  onToggleInlineAdSets,
  onDeleteCampaign,
  onOpenDistribution,
  onOpenAdSetManager,
  onToggleAdSets,
  showAdSets
}: CampaignActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { campaigns } = useCampaignStore();
  
  // Find the campaign from the store
  const campaign = campaigns.find(c => c.id === campaignId);
  
  if (!campaign) {
    return <div>Campaign not found</div>;
  }
  
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onOpenDistribution}>
            <Database className="mr-2 h-4 w-4" />
            Distribution du budget
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onOpenAdSetManager}>
            <Database className="mr-2 h-4 w-4" />
            Sous-ensembles
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onToggleInlineAdSets(campaignId)}>
            <Database className="mr-2 h-4 w-4" />
            {showInlineAdSets ? "Masquer les sous-ensembles" : "Afficher les sous-ensembles"}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onToggleChart(campaignId)}>
            <BarChart className="mr-2 h-4 w-4" />
            {showChart ? "Masquer le graphique" : "Afficher le graphique"}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette campagne ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement la campagne
              <strong> {campaignName} </strong>
              et toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                await onDeleteCampaign(campaignId);
                setIsDeleteOpen(false);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Campaign Form Dialog */}
      <EditCampaignForm 
        campaign={campaign}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
