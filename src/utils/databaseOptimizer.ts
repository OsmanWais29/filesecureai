
/**
 * Database optimization utilities for production scale
 */

import { supabase } from '@/lib/supabase';
import { QueryOptimizer, documentCache } from './performanceOptimizer';
import { errorTracker } from './errorTracking';

interface QueryConfig {
  cacheKey?: string;
  cacheTtl?: number;
  retries?: number;
  timeout?: number;
  paginate?: boolean;
  pageSize?: number;
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryMetrics = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    slowQueries: number;
  }>();

  private constructor() {
    this.setupMetricsCleanup();
  }

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  private setupMetricsCleanup(): void {
    // Clean up metrics every hour
    setInterval(() => {
      this.queryMetrics.clear();
    }, 3600000);
  }

  private recordQueryMetric(queryName: string, duration: number): void {
    const metric = this.queryMetrics.get(queryName) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      slowQueries: 0
    };

    metric.count++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.count;
    
    // Consider queries > 1s as slow
    if (duration > 1000) {
      metric.slowQueries++;
    }

    this.queryMetrics.set(queryName, metric);

    // Log slow queries
    if (duration > 2000) {
      errorTracker.captureError(new Error(`Slow query detected: ${queryName}`), {
        severity: 'medium',
        component: 'DatabaseOptimizer',
        context: { queryName, duration, avgTime: metric.avgTime }
      });
    }
  }

  async optimizedQuery<T>(
    queryName: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    config: QueryConfig = {}
  ): Promise<{ data: T | null; error: any; fromCache?: boolean }> {
    const {
      cacheKey,
      cacheTtl = 300000, // 5 minutes default
      retries = 2,
      timeout = 30000, // 30 seconds
      paginate = false,
      pageSize = 50
    } = config;

    // Check cache first
    if (cacheKey && documentCache.has(cacheKey)) {
      return { data: documentCache.get(cacheKey), error: null, fromCache: true };
    }

    const startTime = Date.now();
    
    try {
      // Deduplicate identical queries
      const result = await QueryOptimizer.deduplicateQuery(
        cacheKey || queryName,
        async () => {
          let attempts = 0;
          while (attempts <= retries) {
            try {
              // Add timeout wrapper
              const queryPromise = queryFn();
              const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout')), timeout)
              );

              return await Promise.race([queryPromise, timeoutPromise]);
            } catch (error) {
              attempts++;
              if (attempts > retries) {
                throw error;
              }
              
              // Exponential backoff
              await new Promise(resolve => 
                setTimeout(resolve, Math.pow(2, attempts) * 1000)
              );
            }
          }
          throw new Error('Max retries exceeded');
        }
      );

      const duration = Date.now() - startTime;
      this.recordQueryMetric(queryName, duration);

      // Cache successful results
      if (cacheKey && result.data && !result.error) {
        documentCache.set(cacheKey, result.data, cacheTtl);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQueryMetric(queryName, duration);

      errorTracker.captureError(error as Error, {
        severity: 'medium',
        component: 'DatabaseOptimizer',
        context: { queryName, duration, retries }
      });

      return { data: null, error };
    }
  }

  // Optimized document queries
  async getDocuments(config: {
    userId?: string;
    folderId?: string;
    limit?: number;
    offset?: number;
    searchTerm?: string;
  }) {
    const { userId, folderId, limit = 50, offset = 0, searchTerm } = config;
    
    let query = supabase
      .from('documents')
      .select(`
        id,
        title,
        type,
        size,
        created_at,
        updated_at,
        ai_processing_status,
        is_folder,
        parent_folder_id,
        metadata
      `)
      .range(offset, offset + limit - 1)
      .order('updated_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (folderId) {
      query = query.eq('parent_folder_id', folderId);
    }

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    const cacheKey = `documents_${userId}_${folderId}_${limit}_${offset}_${searchTerm}`;
    
    return this.optimizedQuery(
      'getDocuments',
      () => query,
      { cacheKey, cacheTtl: 60000 } // 1 minute cache
    );
  }

  // Optimized client queries
  async getClients(config: {
    limit?: number;
    offset?: number;
    searchTerm?: string;
    status?: string;
  }) {
    const { limit = 50, offset = 0, searchTerm, status } = config;
    
    let query = supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        status,
        engagement_score,
        last_interaction,
        created_at,
        updated_at
      `)
      .range(offset, offset + limit - 1)
      .order('updated_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const cacheKey = `clients_${limit}_${offset}_${searchTerm}_${status}`;
    
    return this.optimizedQuery(
      'getClients',
      () => query,
      { cacheKey, cacheTtl: 120000 } // 2 minutes cache
    );
  }

  // Optimized task queries
  async getTasks(config: {
    userId?: string;
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }) {
    const { userId, status, priority, limit = 50, offset = 0 } = config;
    
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        assigned_to,
        created_by,
        document_id,
        created_at,
        updated_at
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`assigned_to.eq.${userId},created_by.eq.${userId}`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    const cacheKey = `tasks_${userId}_${status}_${priority}_${limit}_${offset}`;
    
    return this.optimizedQuery(
      'getTasks',
      () => query,
      { cacheKey, cacheTtl: 30000 } // 30 seconds cache
    );
  }

  // Batch operations for better performance
  async batchInsert<T>(
    tableName: string,
    records: T[],
    batchSize: number = 100
  ): Promise<{ success: boolean; errors: any[] }> {
    const errors: any[] = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from(tableName)
          .insert(batch);

        if (error) {
          errors.push({ batch: i / batchSize, error });
        }
      } catch (error) {
        errors.push({ batch: i / batchSize, error });
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  async batchUpdate<T>(
    tableName: string,
    updates: Array<{ id: string; data: Partial<T> }>,
    batchSize: number = 50
  ): Promise<{ success: boolean; errors: any[] }> {
    const errors: any[] = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      try {
        await Promise.all(
          batch.map(({ id, data }) =>
            supabase
              .from(tableName)
              .update(data)
              .eq('id', id)
          )
        );
      } catch (error) {
        errors.push({ batch: i / batchSize, error });
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  // Analytics and metrics
  getQueryMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [queryName, data] of this.queryMetrics.entries()) {
      metrics[queryName] = {
        ...data,
        slowQueryRate: data.slowQueries / data.count
      };
    }

    return metrics;
  }

  // Connection pool monitoring
  async checkDatabaseHealth(): Promise<{
    isHealthy: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      return {
        isHealthy: !error,
        responseTime,
        error: error?.message
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  // Cache management
  clearCache(): void {
    documentCache.clear();
  }

  getCacheStats() {
    return documentCache.getStats();
  }
}

// Export singleton instance
export const dbOptimizer = DatabaseOptimizer.getInstance();

// React hooks for optimized queries
export const useOptimizedQuery = <T>(
  queryName: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  config: QueryConfig = {}
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);
  const [fromCache, setFromCache] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    
    const executeQuery = async () => {
      setLoading(true);
      
      try {
        const result = await dbOptimizer.optimizedQuery(queryName, queryFn, config);
        
        if (isMounted) {
          setData(result.data);
          setError(result.error);
          setFromCache(result.fromCache || false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    executeQuery();

    return () => {
      isMounted = false;
    };
  }, [queryName, JSON.stringify(config)]);

  return { data, loading, error, fromCache };
};
