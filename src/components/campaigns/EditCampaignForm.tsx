
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaignStore } from '@/store/campaignStore';
import { Campaign, MediaChannel, MarketingObjective } from '@/types/campaign';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface EditCampaignFormProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignForm({ campaign, open, onOpenChange }: EditCampaignFormProps) {
  const { updateCampaign } = useCampaignStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: campaign.name,
    objective: campaign.objective,
    targetAudience: campaign.targetAudience,
    startDate: campaign.startDate,
    durationDays: campaign.durationDays,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user changes it
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom de la campagne est requis';
    }
    
    if (!formData.targetAudience.trim()) {
      errors.targetAudience = 'L\'audience cible est requise';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'La date de début est requise';
    }
    
    if (formData.durationDays <= 0) {
      errors.durationDays = 'La durée doit être supérieure à 0 jours';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erreur",
        description: 'Veuillez corriger les erreurs du formulaire avant de soumettre',
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateCampaign(campaign.id, {
        ...campaign, 
        name: formData.name,
        objective: formData.objective as MarketingObjective,
        targetAudience: formData.targetAudience,
        startDate: formData.startDate,
        durationDays: formData.durationDays
      });
      
      toast({
        title: "Succès",
        description: 'Campagne mise à jour avec succès',
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Erreur",
        description: 'Erreur lors de la mise à jour de la campagne',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isSubmitting) return; // Prevent closing while submitting
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier la campagne</DialogTitle>
          <DialogDescription>Mettez à jour les détails de la campagne.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={formErrors.name ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="objective">Objectif marketing</Label>
            <Select 
              value={formData.objective} 
              onValueChange={(value) => handleInputChange('objective', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un objectif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Notoriété</SelectItem>
                <SelectItem value="consideration">Considération</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="loyalty">Fidélité</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Audience cible</Label>
            <Input 
              id="targetAudience" 
              value={formData.targetAudience} 
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className={formErrors.targetAudience ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {formErrors.targetAudience && (
              <p className="text-sm text-red-500">{formErrors.targetAudience}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                      formErrors.startDate && "border-red-500"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.startDate)}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('startDate', format(date, "yyyy-MM-dd"));
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {formErrors.startDate && (
                <p className="text-sm text-red-500">{formErrors.startDate}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="durationDays">Durée (jours)</Label>
              <Input 
                id="durationDays" 
                type="number"
                min="1"
                value={formData.durationDays} 
                onChange={(e) => handleInputChange('durationDays', parseInt(e.target.value))}
                className={formErrors.durationDays ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.durationDays && (
                <p className="text-sm text-red-500">{formErrors.durationDays}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
