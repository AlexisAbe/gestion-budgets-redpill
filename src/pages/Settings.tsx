
import React from 'react';
import { GlobalPercentageSettings } from '@/components/budget/GlobalPercentageSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <Tabs defaultValue="budget" className="w-full">
        <TabsList>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>
        <TabsContent value="budget" className="pt-4">
          <GlobalPercentageSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
