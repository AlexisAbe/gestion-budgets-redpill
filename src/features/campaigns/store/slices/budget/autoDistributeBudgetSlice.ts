
import { CampaignState } from '../../types';
import { Campaign } from '@/types/campaign';
import { applyCampaignDistribution } from '../../utils/budgetStoreUtils';

export const createAutoDistributeBudgetSlice = (set: any, get: () => CampaignState) => ({
  autoDistributeBudget: async (
    campaignId: string,
    distributionStrategy: 'even' | 'front-loaded' | 'back-loaded' | 'bell-curve' | 'manual',
    percentagesOrApplyGlobally?: Record<string, number> | boolean
  ): Promise<void> => {
    try {
      // Determine if the third parameter is percentages or applyGlobally flag
      let percentages: Record<string, number> | undefined = undefined;
      let applyGlobally = false;
      
      if (typeof percentagesOrApplyGlobally === 'boolean') {
        applyGlobally = percentagesOrApplyGlobally;
      } else if (percentagesOrApplyGlobally) {
        percentages = percentagesOrApplyGlobally;
      }

      const { campaigns, weeks, filteredCampaigns } = get();
      
      if (applyGlobally) {
        // Apply to all filteredCampaigns (which respect client filtering)
        const updateOperations = [];
        const distributionResults = {};
        
        for (const campaign of filteredCampaigns) {
          updateOperations.push(
            applyCampaignDistribution(campaign, weeks, distributionStrategy, percentages)
              .then(distribution => {
                distributionResults[campaign.id] = distribution;
              })
          );
        }
        
        // Wait for all operations to complete
        await Promise.all(updateOperations);
        
        // Update the store for all campaigns at once
        set((state: CampaignState) => {
          const updatedCampaigns = state.campaigns.map(campaign => {
            if (distributionResults[campaign.id]) {
              return {
                ...campaign,
                weeklyBudgets: {
                  ...campaign.weeklyBudgets,
                  ...distributionResults[campaign.id]
                }
              };
            }
            return campaign;
          });
          
          const updatedFilteredCampaigns = state.filteredCampaigns.map(campaign => {
            if (distributionResults[campaign.id]) {
              return {
                ...campaign,
                weeklyBudgets: {
                  ...campaign.weeklyBudgets,
                  ...distributionResults[campaign.id]
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
      } else {
        // Just apply to single campaign
        const campaign = campaigns.find(c => c.id === campaignId);
        
        if (!campaign) {
          throw new Error('Campaign not found');
        }
        
        const distribution = await applyCampaignDistribution(
          campaign, 
          weeks, 
          distributionStrategy, 
          percentages
        );
        
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
      }
    } catch (error) {
      console.error('Error auto-distributing budget:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
});
