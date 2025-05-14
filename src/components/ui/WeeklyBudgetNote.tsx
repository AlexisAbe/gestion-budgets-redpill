
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StickyNoteIcon, PencilIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCampaignStore } from '@/store/campaignStore';
import { useAdSetStore } from '@/store/adSetStore';

interface WeeklyBudgetNoteProps {
  entityId: string;
  weekLabel: string;
  isAdSet?: boolean;
  existingNote?: string;
}

export function WeeklyBudgetNote({ 
  entityId, 
  weekLabel, 
  isAdSet = false, 
  existingNote 
}: WeeklyBudgetNoteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(existingNote || '');
  const { updateWeeklyNote: updateCampaignNote } = useCampaignStore();
  const { updateAdSetWeeklyNote } = useAdSetStore();
  
  const handleSaveNote = async () => {
    try {
      if (isAdSet) {
        await updateAdSetWeeklyNote(entityId, weekLabel, note);
      } else {
        await updateCampaignNote(entityId, weekLabel, note);
      }
      
      toast.success('Note enregistrée avec succès');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de l\'enregistrement de la note');
    }
  };
  
  const hasExistingNote = !!existingNote;
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`p-1 h-6 w-6 rounded-full ${hasExistingNote ? 'text-yellow-500' : 'text-muted-foreground'}`}
        onClick={() => setIsOpen(true)}
        title={hasExistingNote ? "Voir/Modifier la note" : "Ajouter une note"}
      >
        {hasExistingNote ? (
          <StickyNoteIcon size={16} />
        ) : (
          <PencilIcon size={16} />
        )}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasExistingNote ? 'Modifier la note' : 'Ajouter une note'} - {weekLabel}
            </DialogTitle>
          </DialogHeader>
          
          <Textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            placeholder="Entrez votre note ici..."
            className="min-h-[150px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveNote}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
