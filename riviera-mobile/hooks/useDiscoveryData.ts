import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { useAppStore } from '../store/appStore';
import { VenueStatus, LiveEvent } from '../types/api';

/**
 * Hook for fetching discovery data based on current mode
 * Automatically switches between venue status and live events
 */
export const useDiscoveryData = () => {
  const mode = useAppStore(state => state.mode);
  const getFilterQuery = useAppStore(state => state.getFilterQuery);
  
  // Fetch venue status for Day Mode
  const venueQuery = useQuery({
    queryKey: ['venues', 'status', getFilterQuery()],
    queryFn: () => apiService.getVenueStatus(getFilterQuery()),
    enabled: mode === 'day',
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
    staleTime: 15000, // Consider data stale after 15 seconds
  });
  
  // Fetch live events for Night Mode
  const eventsQuery = useQuery({
    queryKey: ['events', 'live', getFilterQuery()],
    queryFn: () => apiService.getLiveEvents(getFilterQuery()),
    enabled: mode === 'night',
    refetchInterval: 60000, // Refetch every minute for events
    staleTime: 30000, // Consider data stale after 30 seconds
  });
  
  // Transform data for consistent interface
  const mapData = (): (VenueStatus | LiveEvent)[] => {
    if (mode === 'day' && venueQuery.data) {
      return venueQuery.data.venues;
    }
    if (mode === 'night' && eventsQuery.data) {
      return eventsQuery.data.events;
    }
    return [];
  };
  
  const activeQuery = mode === 'day' ? venueQuery : eventsQuery;
  
  return {
    data: mapData(),
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    isRefetching: activeQuery.isRefetching,
    refetch: activeQuery.refetch,
    // Computed states
    isEmpty: mapData().length === 0 && !activeQuery.isLoading,
    hasData: mapData().length > 0,
  };
};

/**
 * Hook for fetching venue/event details
 */
export const useVenueDetail = (id: string | null, type: 'venue' | 'event') => {
  return useQuery({
    queryKey: ['detail', type, id],
    queryFn: () => {
      if (!id) throw new Error('No ID provided');
      return type === 'venue' 
        ? apiService.getVenueDetail(id)
        : apiService.getEventDetail(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};