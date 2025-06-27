
/**
 * Production-grade performance optimization utilities
 */

import { startTiming, endTiming } from './performanceMonitor';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}

class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 300000, maxSize: 100 }) {
    this.config = config;
    this.setupCleanup();
  }

  private setupCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires) {
        this.cache.delete(key);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      const toRemove = entries
        .sort((a, b) => a[1].expires - b[1].expires)
        .slice(0, this.cache.size - this.config.maxSize);
      
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  set(key: string, data: any, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0 // Would need hit tracking for actual hit rate
    };
  }
}

// Global cache instances
export const documentCache = new MemoryCache({ ttl: 600000, maxSize: 50 }); // 10 minutes
export const userCache = new MemoryCache({ ttl: 300000, maxSize: 100 }); // 5 minutes
export const apiCache = new MemoryCache({ ttl: 60000, maxSize: 200 }); // 1 minute

// Query optimization utilities
export class QueryOptimizer {
  private static pendingQueries = new Map<string, Promise<any>>();

  static async deduplicateQuery<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    // If query is already pending, return the existing promise
    if (this.pendingQueries.has(key)) {
      return this.pendingQueries.get(key)!;
    }

    // Start new query
    const queryPromise = queryFn().finally(() => {
      this.pendingQueries.delete(key);
    });

    this.pendingQueries.set(key, queryPromise);
    return queryPromise;
  }

  static batchQueries<T>(
    queries: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> {
    const batches: Array<Array<() => Promise<T>>> = [];
    
    for (let i = 0; i < queries.length; i += batchSize) {
      batches.push(queries.slice(i, i + batchSize));
    }

    return batches.reduce(async (acc, batch) => {
      const results = await acc;
      const batchResults = await Promise.all(batch.map(query => query()));
      return [...results, ...batchResults];
    }, Promise.resolve([] as T[]));
  }
}

// Database query optimization
export const optimizeSupabaseQuery = (tableName: string, queryBuilder: any) => {
  startTiming(`db-query-${tableName}`);
  
  return queryBuilder.finally(() => {
    endTiming(`db-query-${tableName}`);
  });
};

// Component performance utilities
export const withPerformanceTracking = <T extends React.ComponentType<any>>(
  Component: T,
  componentName?: string
): T => {
  const name = componentName || Component.displayName || Component.name;
  
  const WrappedComponent = (props: any) => {
    React.useEffect(() => {
      startTiming(`component-mount-${name}`);
      return () => {
        endTiming(`component-mount-${name}`);
      };
    }, []);

    React.useEffect(() => {
      startTiming(`component-render-${name}`);
      const timer = setTimeout(() => {
        endTiming(`component-render-${name}`);
      }, 0);

      return () => clearTimeout(timer);
    });

    return React.createElement(Component, props);
  };

  return WrappedComponent as T;
};

// Image optimization utilities
export const optimizeImageLoad = (src: string, options: {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}) => {
  const { quality = 80, width, height, format = 'webp' } = options;
  
  // This would integrate with an image optimization service
  // For now, return the original src
  return src;
};

// Bundle optimization utilities
export const lazyLoadComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentNode
) => {
  return React.lazy(() => {
    startTiming('component-lazy-load');
    return importFn().finally(() => {
      endTiming('component-lazy-load');
    });
  });
};

// Network optimization
export class NetworkOptimizer {
  private static retryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000
  };

  static async withRetry<T>(
    operation: () => Promise<T>,
    config = this.retryConfig
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === config.maxRetries) {
          throw lastError;
        }

        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }
}

// Resource monitoring
export class ResourceMonitor {
  private static observers = new Set<PerformanceObserver>();

  static startMonitoring(): void {
    if ('PerformanceObserver' in window) {
      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.add(longTaskObserver);
      } catch (e) {
        // Long task observer not supported
      }

      // Monitor layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).value > 0.1) {
            console.warn(`Layout shift detected: ${(entry as any).value}`);
          }
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.add(clsObserver);
      } catch (e) {
        // Layout shift observer not supported
      }
    }
  }

  static stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  static getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }
}

// Initialize performance monitoring
ResourceMonitor.startMonitoring();
