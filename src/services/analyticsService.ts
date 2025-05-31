
export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>) {
    this.events.push({
      ...event,
      timestamp: Date.now()
    });
    console.log('Analytics event tracked:', event);
  }

  trackPageView(pageName: string) {
    return () => {
      this.trackEvent({
        type: 'page_view',
        metadata: { page: pageName }
      });
    };
  }

  trackInteraction(component: string, action: string, metadata?: Record<string, any>) {
    this.trackEvent({
      type: 'interaction',
      metadata: {
        component,
        action,
        ...metadata
      }
    });
  }

  getEvents() {
    return this.events;
  }
}

export const analyticsService = new AnalyticsService();
