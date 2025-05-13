
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCampaignStore } from '@/store/campaignStore';
import { Campaign } from '@/types/campaign';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BudgetDistributionModalProps {
  campaign: Campaign;
  trigger: React.ReactNode;
}

export function BudgetDistributionModal({ campaign, trigger }: BudgetDistributionModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'even' | 'front-loaded' | 'back-loaded' | 'bell-curve'>('even');
  const { autoDistributeBudget } = useCampaignStore();

  const handleDistribute = () => {
    autoDistributeBudget(campaign.id, selectedMethod);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Distribute Budget</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose how to distribute {campaign.totalBudget.toLocaleString('fr-FR')}€ across the campaign duration ({campaign.durationDays} days)
          </p>
          
          <Tabs defaultValue="auto" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="auto" className="flex-1">Auto Distribution</TabsTrigger>
              <TabsTrigger value="manual" className="flex-1">Manual Percentages</TabsTrigger>
            </TabsList>
            <TabsContent value="auto" className="py-4">
              <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as any)}>
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="even" id="even" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="even" className="font-medium">
                      Even Distribution
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Equal budget across all weeks of the campaign
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="front-loaded" id="front-loaded" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="front-loaded" className="font-medium">
                      Front-Loaded
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Higher budget at the beginning, tapering off towards the end
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="back-loaded" id="back-loaded" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="back-loaded" className="font-medium">
                      Back-Loaded
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Lower budget at the beginning, increasing towards the end
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="bell-curve" id="bell-curve" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="bell-curve" className="font-medium">
                      Bell Curve
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Peak budget in the middle of the campaign
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </TabsContent>
            <TabsContent value="manual" className="py-4">
              <p className="text-sm mb-4">
                Coming soon: Manual percentage distribution
              </p>
              <p className="text-sm text-muted-foreground">
                In a future version, you'll be able to manually set percentages for each week.
              </p>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDistribute}>
            Distribute Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
