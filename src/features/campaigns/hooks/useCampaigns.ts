
import { useQuery } from '@tanstack/react-query';
import { Campaign } from '@/types/campaign';
import { fetchCampaignsService } from '../services/fetchCampaignsService';

interface UseCampaignsOptions {
  clientId?: string;
  enabled?: boolean;
  staleTime?: number;
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const { clientId, enabled = true, staleTime = 5 * 60 * 1000 } = options;
  
  return useQuery<Campaign[], Error>({
    queryKey: ['campaigns', clientId],
    queryFn: () => fetchCampaignsService(clientId),
    enabled,
    staleTime, // 5 minutes par défaut
  });
}
