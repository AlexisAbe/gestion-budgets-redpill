
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaign';
import { WeeklyView } from '@/utils/dateUtils';
import { exportAsCSV, exportAsJSON } from '@/utils/exportUtils';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface ExportToolsProps {
  campaigns: Campaign[];
  weeks: WeeklyView[];
}

export function ExportTools({ campaigns, weeks }: ExportToolsProps) {
  const handleExportCSV = () => {
    if (campaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }
    
    const weekLabels = weeks.map(week => week.weekLabel);
    exportAsCSV(campaigns, weekLabels);
    toast.success('Campaigns exported as CSV');
  };
  
  const handleExportJSON = () => {
    if (campaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }
    
    exportAsJSON(campaigns);
    toast.success('Campaigns exported as JSON');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
  );
}
