
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateWeeksForYear } from '@/utils/dateUtils';

interface GlobalBudgetState {
  weeklyPercentages: Record<string, number>;
  setWeeklyPercentages: (percentages: Record<string, number>) => void;
  initializeDefaultPercentages: () => void;
  isInitialized: boolean;
}

export const useGlobalBudgetStore = create<GlobalBudgetState>()(
  persist(
    (set, get) => ({
      weeklyPercentages: {},
      isInitialized: false,
      
      setWeeklyPercentages: (percentages) => {
        set({ weeklyPercentages: percentages, isInitialized: true });
      },
      
      initializeDefaultPercentages: () => {
        if (get().isInitialized) return;
        
        const weeks = generateWeeksForYear();
        const weekCount = weeks.length;
        
        if (weekCount === 0) return;
        
        // Initialize with even distribution
        const evenPercentage = Math.floor(100 / weekCount);
        const remainder = 100 - (evenPercentage * weekCount);
        
        const percentages: Record<string, number> = {};
        weeks.forEach((week, index) => {
          if (index === weekCount - 1) {
            // Last week gets the remainder to ensure total is exactly 100
            percentages[week.weekLabel] = evenPercentage + remainder;
          } else {
            percentages[week.weekLabel] = evenPercentage;
          }
        });
        
        set({ weeklyPercentages: percentages, isInitialized: true });
      }
    }),
    {
      name: 'global-budget-percentages',
    }
  )
);
