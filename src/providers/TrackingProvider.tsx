
import React, { createContext, useContext, ReactNode } from 'react';
import { analyticsService, AnalyticsEvent } from '@/services/analyticsService';

interface TrackingContextType {
  trackEvent: (category: AnalyticsEvent['category'], action: string, metadata?: Record<string, any>) => void;
  trackPageView: (pageName: string) => () => void;
  trackInteraction: (component: string, action: string, metadata?: Record<string, any>) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackInteraction: analyticsService.trackInteraction.bind(analyticsService),
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
