
/**
 * Generates an array of weekly dates for a given year
 * @param year The year to generate weeks for
 * @returns Array of weekly view objects
 */
export function generateWeeksForYear(year: number = 2025): WeeklyView[] {
  const weeks: WeeklyView[] = [];
  
  // Get the first day of the year
  const firstDay = new Date(year, 0, 1);
  
  // Adjust to the first Monday (ISO week starts on Monday)
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
  
  if (dayOfWeek !== 1) { // If not Monday
    firstMonday.setDate(firstDay.getDate() + (8 - dayOfWeek));
  }
  
  // Generate 52 weeks
  for (let i = 0; i < 52; i++) {
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    weeks.push({
      weekNumber: i + 1,
      weekLabel: `S${i + 1}`,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString()
    });
  }
  
  return weeks;
}

export interface WeeklyView {
  weekNumber: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
}

/**
 * Format a date string to DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Calculate the week number for a given date
 */
export function getWeekNumberForDate(dateString: string, weeks: WeeklyView[]): number | null {
  const date = new Date(dateString);
  
  for (const week of weeks) {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    
    if (date >= start && date <= end) {
      return week.weekNumber;
    }
  }
  
  return null;
}

/**
 * Calculate an array of week numbers that a campaign spans
 */
export function getCampaignWeeks(startDate: string, durationDays: number, weeks: WeeklyView[]): number[] {
  const campaignStart = new Date(startDate);
  const campaignEnd = new Date(startDate);
  campaignEnd.setDate(campaignEnd.getDate() + durationDays - 1);
  
  const campaignWeeks: number[] = [];
  
  for (const week of weeks) {
    const weekStart = new Date(week.startDate);
    const weekEnd = new Date(week.endDate);
    
    // If campaign overlaps with this week
    if ((campaignStart <= weekEnd && campaignEnd >= weekStart)) {
      campaignWeeks.push(week.weekNumber);
    }
  }
  
  return campaignWeeks;
}
