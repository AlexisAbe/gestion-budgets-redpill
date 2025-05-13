
import { Campaign } from "../types/campaign";
import { formatDate } from "./dateUtils";

/**
 * Export campaigns data as CSV
 */
export function exportAsCSV(campaigns: Campaign[], weeks: string[]): void {
  // Fixed columns + dynamic week columns
  const headers = [
    'Media Channel',
    'Campaign Name', 
    'Marketing Objective',
    'Target Audience',
    'Start Date',
    'Total Budget (€)',
    'Duration (days)',
    ...weeks
  ];
  
  // Create rows
  const rows = campaigns.map(campaign => {
    const fixedColumns = [
      campaign.mediaChannel,
      campaign.name,
      campaign.objective,
      campaign.targetAudience,
      formatDate(campaign.startDate),
      campaign.totalBudget.toString(),
      campaign.durationDays.toString()
    ];
    
    // Add weekly budget values
    const weeklyValues = weeks.map(week => 
      campaign.weeklyBudgets[week] ? campaign.weeklyBudgets[week].toString() : '0'
    );
    
    return [...fixedColumns, ...weeklyValues];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `belambra-campaigns-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export campaigns data as JSON
 */
export function exportAsJSON(campaigns: Campaign[]): void {
  const dataStr = JSON.stringify(campaigns, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `belambra-campaigns-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
