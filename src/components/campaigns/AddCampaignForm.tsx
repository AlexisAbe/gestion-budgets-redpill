
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaignStore } from '@/store/campaignStore';
import { MediaChannel, MarketingObjective } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AddCampaignForm() {
  const { addCampaign, isLoading } = useCampaignStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    mediaChannel: 'META' as MediaChannel,
    name: '',
    objective: 'awareness' as MarketingObjective,
    targetAudience: '',
    startDate: new Date().toISOString().split('T')[0],
    totalBudget: 0,
    durationDays: 30,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    
    // Clear general error message
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    
    if (!formData.targetAudience.trim()) {
      errors.targetAudience = 'Target audience is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (formData.totalBudget <= 0) {
      errors.totalBudget = 'Total budget must be greater than 0';
    }
    
    if (formData.durationDays <= 0) {
      errors.durationDays = 'Duration must be greater than 0 days';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire avant de soumettre');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      console.log('Submitting campaign:', formData);
      
      // Create initial weekly budgets - evenly distribute the total
      // Using a simpler approach to avoid calculation errors
      const numWeeks = 5;
      const weeklyAmount = Math.floor(formData.totalBudget / numWeeks);
      const remainder = formData.totalBudget - (weeklyAmount * (numWeeks - 1));
      
      const weeklyBudgets = {
        "S19": weeklyAmount,
        "S20": weeklyAmount,
        "S21": weeklyAmount,
        "S22": weeklyAmount,
        "S23": remainder // Remainder to last week
      };

      await addCampaign({
        ...formData,
        weeklyBudgets
      });
      
      // Reset form and close dialog on success
      setFormData({
        mediaChannel: 'META' as MediaChannel,
        name: '',
        objective: 'awareness' as MarketingObjective,
        targetAudience: '',
        startDate: new Date().toISOString().split('T')[0],
        totalBudget: 0,
        durationDays: 30,
      });
      
      toast.success('Campagne créée avec succès');
      setOpen(false);
    } catch (error: any) {
      console.error('Submit error:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'ajout de la campagne');
      toast.error('Erreur lors de l\'ajout de la campagne');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isSubmitting) return; // Prevent closing while submitting
      setOpen(newOpen);
      
      // Reset error state when dialog is opened/closed
      if (!newOpen) {
        setFormErrors({});
        setErrorMessage(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="flex gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
          <DialogDescription>Create a new marketing campaign with budget allocation</DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mediaChannel">Media Channel</Label>
              <Select 
                value={formData.mediaChannel} 
                onValueChange={(value) => handleInputChange('mediaChannel', value as MediaChannel)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select media channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="META">META</SelectItem>
                  <SelectItem value="GOOGLE">GOOGLE</SelectItem>
                  <SelectItem value="LINKEDIN">LINKEDIN</SelectItem>
                  <SelectItem value="TWITTER">TWITTER</SelectItem>
                  <SelectItem value="DISPLAY">DISPLAY</SelectItem>
                  <SelectItem value="EMAIL">EMAIL</SelectItem>
                  <SelectItem value="OTHER">OTHER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Marketing Objective</Label>
              <Select 
                value={formData.objective} 
                onValueChange={(value) => handleInputChange('objective', value as MarketingObjective)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="consideration">Consideration</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="loyalty">Loyalty</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
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
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input 
              id="targetAudience" 
              value={formData.targetAudience} 
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className={formErrors.targetAudience ? 'border-red-500' : ''}
              placeholder="e.g., Families with children 5-12"
              disabled={isSubmitting}
            />
            {formErrors.targetAudience && (
              <p className="text-sm text-red-500">{formErrors.targetAudience}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={formErrors.startDate ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.startDate && (
                <p className="text-sm text-red-500">{formErrors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (days)</Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Budget (€)</Label>
            <Input 
              id="totalBudget" 
              type="number"
              min="1"
              value={formData.totalBudget} 
              onChange={(e) => handleInputChange('totalBudget', parseInt(e.target.value))}
              className={formErrors.totalBudget ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {formErrors.totalBudget && (
              <p className="text-sm text-red-500">{formErrors.totalBudget}</p>
            )}
            {formData.totalBudget > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(formData.totalBudget)}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
