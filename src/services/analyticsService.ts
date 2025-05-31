
export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface EventCategory {
  id: string;
  name: string;
  count: number;
}

export interface EventSubcategory {
  id: string;
  name: string;
  category: string;
  count: number;
}

export interface EventTrend {
  date: string;
  count: number;
  category?: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userRole: string = 'user';
  private persistenceEnabled: boolean = true;

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
        category: 'navigation',
        metadata: { page: pageName }
      });
    };
  }

  trackInteraction(component: string, action: string, metadata?: Record<string, any>) {
    this.trackEvent({
      type: 'interaction',
      category: 'user_interaction',
      metadata: {
        component,
        action,
        ...metadata
      }
    });
  }

  trackDocumentEvent(documentId: string, action: string, metadata?: Record<string, any>) {
    this.trackEvent({
      type: 'document_event',
      category: 'document',
      metadata: {
        documentId,
        action,
        ...metadata
      }
    });
  }

  trackClientEvent(clientId: string, action: string, metadata?: Record<string, any>) {
    this.trackEvent({
      type: 'client_event',
      category: 'client',
      metadata: {
        clientId,
        action,
        ...metadata
      }
    });
  }

  trackError(error: string, context?: Record<string, any>) {
    this.trackEvent({
      type: 'error',
      category: 'error',
      metadata: {
        error,
        context
      }
    });
  }

  setUserRole(role: string) {
    this.userRole = role;
  }

  setPersistenceEnabled(enabled: boolean) {
    this.persistenceEnabled = enabled;
  }

  getEvents() {
    return this.events;
  }

  getAnalyticsData() {
    return {
      totalEvents: this.events.length,
      eventsByType: this.getEventsByType(),
      recentEvents: this.events.slice(-10)
    };
  }

  getMetrics() {
    return {
      totalPageViews: this.events.filter(e => e.type === 'page_view').length,
      totalInteractions: this.events.filter(e => e.type === 'interaction').length,
      totalErrors: this.events.filter(e => e.type === 'error').length
    };
  }

  getPageViewData() {
    return this.events
      .filter(e => e.type === 'page_view')
      .map(e => ({
        page: e.metadata?.page || 'unknown',
        timestamp: e.timestamp
      }));
  }

  getEventsByCategory(): EventCategory[] {
    const categories = new Map<string, number>();
    this.events.forEach(event => {
      const category = event.category || 'uncategorized';
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries()).map(([id, count]) => ({
      id,
      name: id,
      count
    }));
  }

  getEventsBySubcategory(): EventSubcategory[] {
    const subcategories = new Map<string, { category: string; count: number }>();
    this.events.forEach(event => {
      const category = event.category || 'uncategorized';
      const subcategory = event.type;
      const key = `${category}-${subcategory}`;
      
      if (!subcategories.has(key)) {
        subcategories.set(key, { category, count: 0 });
      }
      subcategories.get(key)!.count++;
    });

    return Array.from(subcategories.entries()).map(([key, data]) => ({
      id: key,
      name: key.split('-')[1],
      category: data.category,
      count: data.count
    }));
  }

  getEventTrends(): EventTrend[] {
    const trends = new Map<string, number>();
    this.events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      trends.set(date, (trends.get(date) || 0) + 1);
    });

    return Array.from(trends.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  getHistoricalData() {
    return this.events.map(event => ({
      ...event,
      date: new Date(event.timestamp).toISOString()
    }));
  }

  private getEventsByType() {
    const types = new Map<string, number>();
    this.events.forEach(event => {
      types.set(event.type, (types.get(event.type) || 0) + 1);
    });
    return Object.fromEntries(types);
  }
}

export const analyticsService = new AnalyticsService();
export { EventCategory, EventSubcategory, EventTrend };
