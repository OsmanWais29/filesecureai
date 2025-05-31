
import { useEffect, useState, useCallback, useMemo } from 'react';
import { analyticsService, EventCategory, EventSubcategory, EventTrend } from '@/services/analyticsService';
import { useDebouncedCallback } from './useDebounce';

interface UseEnhancedAnalyticsOptions {
  pageName?: string;
  userRole?: string;
  enablePersistence?: boolean;
}

export const useEnhancedAnalytics = ({
  pageName,
  userRole = 'user',
  enablePersistence = true
}: UseEnhancedAnalyticsOptions = {}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [trendData, setTrendData] = useState<EventTrend[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Initialize analytics with configuration - only run once on mount
  useEffect(() => {
    // Set user role for analytics
    analyticsService.setUserRole(userRole);
    
    // Configure persistence
    analyticsService.setPersistenceEnabled(enablePersistence);
    
    setIsInitialized(true);
  }, [userRole, enablePersistence]);
  
  // Track page view if pageName is provided - only run when pageName changes
  useEffect(() => {
    if (pageName && isInitialized) {
      // Track page view and return cleanup function
      return analyticsService.trackPageView(pageName);
    }
  }, [pageName, isInitialized]);
  
  // Function to fetch trend data with cache control
  const fetchTrendData = useCallback(async (
    period: 'day' | 'week' | 'month' = 'day',
    options: {
      category?: EventCategory;
      subcategory?: EventSubcategory;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) => {
    // Prevent excessive fetches within a short time
    const now = Date.now();
    if (now - lastFetchTime < 3000 && isLoadingTrends) {
      return; // Don't fetch if we've fetched in the last 3 seconds
    }
    
    setIsLoadingTrends(true);
    setLastFetchTime(now);
    
    try {
      const trends = analyticsService.getEventTrends(period, {
        ...options,
        userRole
      });
      
      setTrendData(trends);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      // Use setTimeout to prevent the flickering of loading state
      setTimeout(() => {
        setIsLoadingTrends(false);
      }, 300);
    }
  }, [userRole, lastFetchTime, isLoadingTrends]);
  
  // Debounced version of event tracking to prevent excessive calls
  const debouncedTrackInteraction = useDebouncedCallback(
    (component: string, action: string, metadata?: Record<string, any>) => {
      analyticsService.trackInteraction(component, action, metadata);
    },
    300
  );
  
  // Create a memoized object to prevent unnecessary re-renders of components that use this hook
  const analyticsApi = useMemo(() => ({
    // Event tracking methods
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackInteraction: debouncedTrackInteraction,
    trackDocumentEvent: analyticsService.trackDocumentEvent.bind(analyticsService),
    trackClientEvent: analyticsService.trackClientEvent.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    
    // Data retrieval methods
    getAnalyticsData: analyticsService.getAnalyticsData.bind(analyticsService),
    getMetrics: analyticsService.getMetrics.bind(analyticsService),
    getPageViewData: analyticsService.getPageViewData.bind(analyticsService),
    getEventsByCategory: analyticsService.getEventsByCategory.bind(analyticsService),
    getEventsBySubcategory: analyticsService.getEventsBySubcategory.bind(analyticsService),
    getHistoricalData: analyticsService.getHistoricalData.bind(analyticsService),
    
    // Trend data and fetching
    trendData,
    isLoadingTrends,
    fetchTrendData,
    
    // Configuration
    setUserRole: analyticsService.setUserRole.bind(analyticsService),
    setPersistenceEnabled: analyticsService.setPersistenceEnabled.bind(analyticsService),
  }), [
    trendData, 
    isLoadingTrends, 
    fetchTrendData, 
    debouncedTrackInteraction
  ]);
  
  return analyticsApi;
};
