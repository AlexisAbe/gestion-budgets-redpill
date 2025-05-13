
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaignStore } from '@/store/campaignStore';
import { MediaChannel, MarketingObjective } from '@/types/campaign';
import { formatCurrency } from '@/utils/budgetUtils';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';

export function AddCampaignForm() {
  const { addCampaign } = useCampaignStore();
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

  const handleSubmit = () => {
    if (validateForm()) {
      addCampaign({
        ...formData,
        weeklyBudgets: {}
      });
      
      // Reset form and close dialog
      setFormData({
        mediaChannel: 'META' as MediaChannel,
        name: '',
        objective: 'awareness' as MarketingObjective,
        targetAudience: '',
        startDate: new Date().toISOString().split('T')[0],
        totalBudget: 0,
        durationDays: 30,
      });
      setOpen(false);
    } else {
      toast.error('Please fix the form errors before submitting');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mediaChannel">Media Channel</Label>
              <Select 
                value={formData.mediaChannel} 
                onValueChange={(value) => handleInputChange('mediaChannel', value as MediaChannel)}
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
