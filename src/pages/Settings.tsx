
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlobalBudgetSettings } from '@/components/budget/GlobalBudgetSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Paramètres</h1>
        </div>
        
        <Tabs defaultValue="budget">
          <TabsList className="mb-6">
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>
          
          <TabsContent value="budget">
            <GlobalBudgetSettings />
          </TabsContent>
          
          <TabsContent value="account">
            <div className="text-muted-foreground">
              Les paramètres du compte seront disponibles prochainement.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
