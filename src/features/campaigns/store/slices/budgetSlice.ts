
import { CampaignState } from '../types';
import { updateWeeklyBudgetService, updateActualBudgetService } from '../../services';
import { distributeBudget } from '@/utils/budget/distribution';

export const createBudgetSlice = (set: any, get: () => CampaignState) => ({
  updateWeeklyBudget: async (campaignId: string, weekLabel: string, amount: number): Promise<void> => {
    try {
      const success = await updateWeeklyBudgetService(campaignId, weekLabel, amount);
      
      if (success) {
        set((state: CampaignState) => {
          // Update campaigns array
          const updatedCampaigns = state.campaigns.map(campaign => {
            if (campaign.id === campaignId) {
              return {
                ...campaign,
                weeklyBudgets: {
                  ...campaign.weeklyBudgets,
                  [weekLabel]: amount
                }
              };
            }
            return campaign;
          });
          
          // Update filteredCampaigns array
          const updatedFilteredCampaigns = state.filteredCampaigns.map(campaign => {
            if (campaign.id === campaignId) {
              return {
                ...campaign,
                weeklyBudgets: {
                  ...campaign.weeklyBudgets,
                  [weekLabel]: amount
                }
              };
            }
            return campaign;
          });
          
          return {
            campaigns: updatedCampaigns,
            filteredCampaigns: updatedFilteredCampaigns
          };
        });
      }
    } catch (error) {
      console.error('Error updating weekly budget:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },
  
  updateActualBudget: async (campaignId: string, weekLabel: string, amount: number): Promise<void> => {
    try {
      const success = await updateActualBudgetService(campaignId, weekLabel, amount);
      
      if (success) {
        set((state: CampaignState) => {
          // Update campaigns array
          const updatedCampaigns = state.campaigns.map(campaign => {
            if (campaign.id === campaignId) {
              return {
                ...campaign,
                actualBudgets: {
                  ...campaign.actualBudgets,
                  [weekLabel]: amount
                }
              };
            }
            return campaign;
          });
          
          // Update filteredCampaigns array
          const updatedFilteredCampaigns = state.filteredCampaigns.map(campaign => {
            if (campaign.id === campaignId) {
              return {
                ...campaign,
                actualBudgets: {
                  ...campaign.actualBudgets,
                  [weekLabel]: amount
                }
              };
            }
            return campaign;
          });
          
          return {
            campaigns: updatedCampaigns,
            filteredCampaigns: updatedFilteredCampaigns
          };
        });
      }
    } catch (error) {
      console.error('Error updating actual budget:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },
  
  autoDistributeBudget: async (
    campaignId: string,
    distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual',
    percentages?: Record<string, number>
  ): Promise<void> => {
    try {
      const { campaigns, weeks } = get();
      const campaign = campaigns.find(c => c.id === campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // Determine which weeks the campaign spans
      const campaignStart = new Date(campaign.startDate);
      const campaignEnd = new Date(campaignStart);
      campaignEnd.setDate(campaignEnd.getDate() + campaign.durationDays);
      
      const relevantWeeks = weeks.filter(week => {
        const weekStart = new Date(week.startDate);
        const weekEnd = new Date(week.endDate);
        return (
          (weekStart <= campaignEnd && weekEnd >= campaignStart) || 
          (weekStart <= campaignStart && weekEnd >= campaignStart)
        );
      }).map(week => week.weekLabel);
      
      // Distribute budget
      const distribution = distributeBudget(
        campaign.totalBudget,
        relevantWeeks,
        distributionStrategy,
        percentages
      );
      
      // Apply updates for each week
      for (const [weekLabel, amount] of Object.entries(distribution)) {
        await updateWeeklyBudgetService(campaignId, weekLabel, amount);
      }
      
      // Update the store
      set((state: CampaignState) => {
        // Update campaigns array
        const updatedCampaigns = state.campaigns.map(c => {
          if (c.id === campaignId) {
            return {
              ...c,
              weeklyBudgets: {
                ...c.weeklyBudgets,
                ...distribution
              }
            };
          }
          return c;
        });
        
        // Update filteredCampaigns array
        const updatedFilteredCampaigns = state.filteredCampaigns.map(c => {
          if (c.id === campaignId) {
            return {
              ...c,
              weeklyBudgets: {
                ...c.weeklyBudgets,
                ...distribution
              }
            };
          }
          return c;
        });
        
        return {
          campaigns: updatedCampaigns,
          filteredCampaigns: updatedFilteredCampaigns
        };
      });
    } catch (error) {
      console.error('Error auto-distributing budget:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
});
