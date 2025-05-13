
import React, { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { addExampleCampaigns, useCampaignStore } from '@/store/campaignStore';
import { Separator } from '@/components/ui/separator';
import { FileDown, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportAsCSV, exportAsJSON } from '@/utils/exportUtils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { campaigns, weeks, resetStore } = useCampaignStore();
  
  const handleExportCSV = () => {
    const weekLabels = weeks.map(week => week.weekLabel);
    exportAsCSV(campaigns, weekLabels);
  };
  
  const handleExportJSON = () => {
    exportAsJSON(campaigns);
  };
  
  const handleReset = () => {
    resetStore();
  };
  
  const handleLoadExample = () => {
    if (campaigns.length === 0) {
      addExampleCampaigns();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="flex h-16 items-center px-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-md w-8 h-8 flex items-center justify-center text-primary-foreground font-semibold">
                B
              </div>
              <span className="text-lg font-medium">Belambra Budget</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
            <div className="space-y-4">
              <div className="px-2">
                <h2 className="text-sm font-semibold">Budget Management</h2>
                <Separator className="my-2" />
                <div className="space-y-2 mt-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleLoadExample}
                    disabled={campaigns.length > 0}
                  >
                    Load Example Data
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export Data
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem onClick={handleExportCSV}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportJSON}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleReset}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Data
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b h-16 px-6 flex items-center justify-between">
            <SidebarTrigger />
            <div>
              <h1 className="text-xl font-semibold">Gestion Budgets 2025</h1>
            </div>
            <div className="w-9"></div> {/* Empty div for flex spacing */}
          </header>
          <div className="container py-6 px-4 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
