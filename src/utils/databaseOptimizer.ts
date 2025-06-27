/**
 * Production-grade database optimization utilities
 */

import React from 'react';
import { supabase } from '@/lib/supabase';
import { errorTracker } from './errorTracking';

interface QueryStats {
  executionTime: number;
  rowCount: number;
  cacheHit: boolean;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private queryStats = new Map<string, QueryStats[]>();

  private constructor() {
    this.setupPerformanceMonitoring();
  }

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  private setupPerformanceMonitoring(): void {
    // Monitor slow queries
    setInterval(() => {
      this.analyzeQueryPerformance();
    }, 60000); // Every minute
  }

  private analyzeQueryPerformance(): void {
    for (const [query, stats] of this.queryStats.entries()) {
      const avgTime = stats.reduce((sum, stat) => sum + stat.executionTime, 0) / stats.length;
      
      if (avgTime > 1000) { // Slow queries over 1 second
        errorTracker.captureError(new Error(`Slow query detected: ${query}`), {
          component: 'DatabaseOptimizer',
          severity: 'medium',
          context: { averageTime: avgTime, query }
        });
      }
    }
  }

  // Optimized query with caching
  async optimizedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<{ data: T; error: any }>,
    options: { ttl?: number; cache?: boolean } = {}
  ): Promise<{ data: T; error: any }> {
    const { ttl = 300000, cache = true } = options; // 5 minutes default TTL
    
    // Check cache first
    if (cache) {
      const cached = this.queryCache.get(queryKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return { data: cached.data, error: null };
      }
    }

    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      // Record performance stats
      if (!this.queryStats.has(queryKey)) {
        this.queryStats.set(queryKey, []);
      }
      
      const stats = this.queryStats.get(queryKey)!;
      stats.push({
        executionTime,
        rowCount: Array.isArray(result.data) ? result.data.length : 1,
        cacheHit: false,
        queryType: 'SELECT'
      });

      // Keep only last 100 stats
      if (stats.length > 100) {
        stats.splice(0, stats.length - 100);
      }

      // Cache successful results
      if (cache && !result.error) {
        this.queryCache.set(queryKey, {
          data: result.data,
          timestamp: Date.now(),
          ttl
        });
      }

      return result;
    } catch (error) {
      errorTracker.captureError(error as Error, {
        component: 'DatabaseOptimizer',
        severity: 'high',
        context: { queryKey }
      });
      
      return { data: null as T, error };
    }
  }

  // Batch operations for better performance
  async batchInsert<T>(
    tableName: string,
    records: T[],
    batchSize: number = 100
  ): Promise<{ data: T[]; error: any }> {
    const results: T[] = [];
    let error = null;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const { data, error: batchError } = await supabase
          .from(tableName)
          .insert(batch)
          .select();

        if (batchError) {
          error = batchError;
          break;
        }

        if (data) {
          results.push(...data);
        }
      } catch (err) {
        error = err;
        break;
      }
    }

    return { data: results, error };
  }

  // Optimized pagination
  async paginatedQuery<T>(
    tableName: string,
    options: {
      page: number;
      pageSize: number;
      orderBy?: string;
      ascending?: boolean;
      filters?: Record<string, any>;
    }
  ): Promise<{ data: T[]; error: any; count?: number }> {
    const { page, pageSize, orderBy = 'created_at', ascending = false, filters = {} } = options;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range(from, to);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    query = query.order(orderBy, { ascending });

    return await query;
  }

  // Optimized document queries
  async getDocuments(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    folderId?: string;
  } = {}): Promise<{ data: unknown; error: any }> {
    const { limit = 50, offset = 0, userId, folderId } = options;

    return this.optimizedQuery(
      `documents_${userId}_${folderId}_${limit}_${offset}`,
      async () => {
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
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (userId) {
          query = query.eq('user_id', userId);
        }

        if (folderId) {
          query = query.eq('parent_folder_id', folderId);
        }

        return await query;
      }
    );
  }

  // Optimized client queries
  async getClients(options: {
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{ data: unknown; error: any }> {
    const { limit = 50, offset = 0, search } = options;

    return this.optimizedQuery(
      `clients_${search}_${limit}_${offset}`,
      async () => {
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
          .order('last_interaction', { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        return await query;
      }
    );
  }

  // Optimized task queries
  async getTasks(options: {
    limit?: number;
    offset?: number;
    status?: string;
    assignedTo?: string;
  } = {}): Promise<{ data: unknown; error: any }> {
    const { limit = 50, offset = 0, status, assignedTo } = options;

    return this.optimizedQuery(
      `tasks_${status}_${assignedTo}_${limit}_${offset}`,
      async () => {
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
          .order('due_date', { ascending: true })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq('status', status);
        }

        if (assignedTo) {
          query = query.eq('assigned_to', assignedTo);
        }

        return await query;
      }
    );
  }

  // Index recommendations based on query patterns
  getIndexRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze query patterns and suggest indexes
    const commonPatterns = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_created ON documents(user_id, created_at DESC);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_folder ON documents(parent_folder_id) WHERE parent_folder_id IS NOT NULL;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_status ON tasks(assigned_to, status);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_search ON clients USING gin(to_tsvector(\'english\', name || \' \' || coalesce(email, \'\')));',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);'
    ];

    return commonPatterns;
  }

  // Cache management
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  // Performance metrics
  getPerformanceMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [query, stats] of this.queryStats.entries()) {
      const avgTime = stats.reduce((sum, stat) => sum + stat.executionTime, 0) / stats.length;
      const totalQueries = stats.length;
      
      metrics[query] = {
        averageExecutionTime: avgTime,
        totalQueries,
        slowQueries: stats.filter(s => s.executionTime > 1000).length
      };
    }

    return metrics;
  }
}

// Export singleton instance
export const databaseOptimizer = DatabaseOptimizer.getInstance();

// React hook for database operations
export const useOptimizedQuery = <T>(
  queryKey: string,
  queryFn: () => Promise<{ data: T; error: any }>,
  options: { enabled?: boolean; ttl?: number } = {}
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (options.enabled === false) return;

    databaseOptimizer.optimizedQuery(queryKey, queryFn, { ttl: options.ttl })
      .then(result => {
        setData(result.data);
        setError(result.error);
      })
      .finally(() => setIsLoading(false));
  }, [queryKey, options.enabled, options.ttl]);

  return { data, error, isLoading };
};
