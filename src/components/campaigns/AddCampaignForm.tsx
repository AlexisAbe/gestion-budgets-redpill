
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaignStore } from '@/store/campaignStore';
import { MediaChannel, MarketingObjective, AdSet } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCampaignWeeks } from '@/utils/dateUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { AdSetForm } from '@/components/adSets/AdSetForm';
import { useAdSetStore } from '@/store/adSetStore';

export function AddCampaignForm() {
  const { addCampaign, isLoading, weeks } = useCampaignStore();
  const { addAdSet } = useAdSetStore();
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
  const [includeAdSets, setIncludeAdSets] = useState(false);
  const [adSetsData, setAdSetsData] = useState<Array<Omit<AdSet, "id" | "createdAt" | "updatedAt">>>([]);
  const [currentTab, setCurrentTab] = useState<'basic' | 'adsets'>('basic');

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

    if (includeAdSets) {
      const totalPercentage = adSetsData.reduce((sum, adSet) => sum + adSet.budgetPercentage, 0);
      if (totalPercentage > 100) {
        errors.adSets = 'Total percentage of ad sets cannot exceed 100%';
      }
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
    setErrorMessage(null);
    
    try {
      console.log('Submitting campaign:', formData);
      
      // Get the campaign weeks based on start date and duration
      const campaignWeekNumbers = getCampaignWeeks(formData.startDate, formData.durationDays, weeks);
      
      // Create initial empty weekly budgets object
      const weeklyBudgets: Record<string, number> = {};
      
      // Only if we have weeks for the campaign, distribute the budget evenly
      if (campaignWeekNumbers.length > 0) {
        const weeklyAmount = Math.floor(formData.totalBudget / campaignWeekNumbers.length);
        const remainder = formData.totalBudget - (weeklyAmount * (campaignWeekNumbers.length - 1));
        
        // Distribute budget evenly except for the last week which gets the remainder
        campaignWeekNumbers.forEach((weekNum, index) => {
          const weekLabel = `S${weekNum}`;
          weeklyBudgets[weekLabel] = (index === campaignWeekNumbers.length - 1) 
            ? remainder 
            : weeklyAmount;
        });
      }

      const newCampaignId = await addCampaign({
        ...formData,
        weeklyBudgets
      });
      
      // If ad sets are included and campaign was created successfully
      if (includeAdSets && adSetsData.length > 0 && newCampaignId) {
        console.log('Adding ad sets for campaign:', newCampaignId);
        
        // Add all ad sets with the correct campaign ID
        for (const adSetData of adSetsData) {
          await addAdSet({
            ...adSetData,
            campaignId: newCampaignId
          });
        }
        
        console.log('Ad sets added successfully');
      }
      
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
      setAdSetsData([]);
      setIncludeAdSets(false);
      
      toast({
        title: "Succès",
        description: 'Campagne créée avec succès',
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Submit error:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'ajout de la campagne');
      toast({
        title: "Erreur",
        description: 'Erreur lors de l\'ajout de la campagne',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdSetsUpdate = (newAdSets: Array<Omit<AdSet, "id" | "createdAt" | "updatedAt">>) => {
    setAdSetsData(newAdSets);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isSubmitting) return; // Prevent closing while submitting
      setOpen(newOpen);
      
      // Reset error state and form when dialog is opened/closed
      if (!newOpen) {
        setFormErrors({});
        setErrorMessage(null);
        setIncludeAdSets(false);
        setAdSetsData([]);
        setCurrentTab('basic');
      }
    }}>
      <DialogTrigger asChild>
        <Button className="flex gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
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

        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${currentTab === 'basic' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setCurrentTab('basic')}
          >
            Informations de base
          </button>
          <button
            className={`px-4 py-2 ${currentTab === 'adsets' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setCurrentTab('adsets')}
            disabled={!includeAdSets}
          >
            Sous-ensembles
          </button>
        </div>
        
        {currentTab === 'basic' ? (
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

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeAdSets" 
                checked={includeAdSets}
                onCheckedChange={(checked) => {
                  setIncludeAdSets(!!checked);
                  if (checked) {
                    setCurrentTab('adsets');
                  }
                }}
                disabled={isSubmitting}
              />
              <Label htmlFor="includeAdSets" className="cursor-pointer">
                Ajouter des sous-ensembles de publicité
              </Label>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <AdSetForm 
              campaignId="temp" 
              campaignBudget={formData.totalBudget}
              onSave={handleAdSetsUpdate}
            />
            {formErrors.adSets && (
              <p className="text-sm text-red-500 mt-2">{formErrors.adSets}</p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {currentTab === 'adsets' && (
            <Button variant="outline" onClick={() => setCurrentTab('basic')} disabled={isSubmitting}>
              Retour
            </Button>
          )}
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || (includeAdSets && currentTab === 'basic')}>
            {isSubmitting ? 'Saving...' : currentTab === 'basic' && includeAdSets ? 'Continuer' : 'Save Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
