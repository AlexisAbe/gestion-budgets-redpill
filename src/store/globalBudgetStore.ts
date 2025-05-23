import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateWeeksForYear } from '@/utils/dateUtils';

interface BudgetConfiguration {
  name: string;
  percentages: Record<string, number>;
}

interface GlobalBudgetState {
  // Store multiple configurations
  budgetConfigurations: Record<string, BudgetConfiguration>;
  activeConfigId: string | null;
  weeklyPercentages: Record<string, number>;
  isInitialized: boolean;
  
  // Methods to manage configurations
  addConfiguration: (name: string, percentages: Record<string, number>) => void;
  updateConfiguration: (id: string, data: Partial<BudgetConfiguration>) => void;
  deleteConfiguration: (id: string) => void;
  setActiveConfiguration: (id: string | null) => void;
  
  // Original methods
  setWeeklyPercentages: (percentages: Record<string, number>) => void;
  initializeDefaultPercentages: () => void;
}

export const useGlobalBudgetStore = create<GlobalBudgetState>()(
  persist(
    (set, get) => ({
      budgetConfigurations: {},
      activeConfigId: null,
      weeklyPercentages: {},
      isInitialized: false,
      
      addConfiguration: (name: string, percentages: Record<string, number>) => {
        const id = `config-${Date.now()}`;
        set((state) => ({
          budgetConfigurations: {
            ...state.budgetConfigurations,
            [id]: { name, percentages }
          }
        }));
        return id;
      },
      
      updateConfiguration: (id: string, data: Partial<BudgetConfiguration>) => {
        set((state) => {
          const config = state.budgetConfigurations[id];
          if (!config) return state;
          
          return {
            budgetConfigurations: {
              ...state.budgetConfigurations,
              [id]: {
                ...config,
                ...data
              }
            }
          };
        });
      },
      
      deleteConfiguration: (id: string) => {
        set((state) => {
          const newConfigurations = { ...state.budgetConfigurations };
          delete newConfigurations[id];
          
          // If the active config is being deleted, reset it
          const newActiveId = state.activeConfigId === id ? null : state.activeConfigId;
          
          return {
            budgetConfigurations: newConfigurations,
            activeConfigId: newActiveId
          };
        });
      },
      
      setActiveConfiguration: (id: string | null) => {
        set((state) => {
          // If id exists in configurations, set it as active and update weeklyPercentages
          if (id && state.budgetConfigurations[id]) {
            return {
              activeConfigId: id,
              weeklyPercentages: state.budgetConfigurations[id].percentages
            };
          }
          // Otherwise just reset the active id
          return { activeConfigId: null };
        });
      },
      
      setWeeklyPercentages: (percentages: Record<string, number>) => {
        set({ weeklyPercentages: percentages, isInitialized: true });
        
        // Update active configuration if it exists
        const { activeConfigId, budgetConfigurations } = get();
        if (activeConfigId && budgetConfigurations[activeConfigId]) {
          set((state) => ({
            budgetConfigurations: {
              ...state.budgetConfigurations,
              [activeConfigId]: {
                ...state.budgetConfigurations[activeConfigId],
                percentages
              }
            }
          }));
        }
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
        
        // Add a default configuration
        const defaultConfigId = `config-default-${Date.now()}`;
        set({
          weeklyPercentages: percentages,
          isInitialized: true,
          budgetConfigurations: {
            [defaultConfigId]: {
              name: "Configuration par défaut",
              percentages
            }
          },
          activeConfigId: defaultConfigId
        });
      }
    }),
    {
      name: 'global-budget-percentages',
    }
  )
);
