
import { useCallback } from 'react';

interface AnalyticsEvent {
  [key: string]: any;
}

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties?: AnalyticsEvent) => {
    // Prevent excessive logging by checking if we've already logged this event recently
    const lastLog = sessionStorage.getItem(`analytics_${eventName}`);
    const now = Date.now();
    
    if (lastLog && now - parseInt(lastLog) < 1000) {
      // Skip logging if same event was logged within last second
      return;
    }
    
    sessionStorage.setItem(`analytics_${eventName}`, now.toString());
    
    console.info(`[Analytics] Event: ${eventName}`, properties || {});
  }, []);

  return { trackEvent };
};
