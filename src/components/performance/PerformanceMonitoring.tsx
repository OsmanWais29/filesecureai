
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Activity, 
  Database, 
  Server, 
  Clock, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  activeUsers: number;
  errorRate: number;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  database: 'online' | 'slow' | 'offline';
  api: 'healthy' | 'degraded' | 'down';
  storage: 'optimal' | 'full' | 'error';
  cache: 'active' | 'stale' | 'disabled';
}

export const PerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    database: 'online',
    api: 'healthy',
    storage: 'optimal',
    cache: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    
    // Simulate loading performance data
    setTimeout(() => {
      const now = new Date();
      const mockMetrics: PerformanceMetric[] = Array.from({ length: 24 }, (_, i) => {
        const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        return {
          timestamp: timestamp.toISOString(),
          responseTime: 150 + Math.random() * 100,
          cpuUsage: 30 + Math.random() * 40,
          memoryUsage: 45 + Math.random() * 30,
          activeUsers: 50 + Math.random() * 200,
          errorRate: Math.random() * 2
        };
      });

      setMetrics(mockMetrics);
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const getCurrentMetrics = () => {
    if (metrics.length === 0) return null;
    return metrics[metrics.length - 1];
  };

  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'optimal':
      case 'active':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
      case 'warning':
      case 'slow':
      case 'degraded':
      case 'full':
      case 'stale':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle };
      case 'critical':
      case 'offline':
      case 'down':
      case 'error':
      case 'disabled':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Activity };
    }
  };

  const currentMetrics = getCurrentMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Performance Monitoring</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={loadPerformanceData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(systemHealth).map(([key, status]) => {
          const healthConfig = getHealthStatus(status);
          const Icon = healthConfig.icon;
          
          return (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${healthConfig.bg}`}>
                    <Icon className={`h-4 w-4 ${healthConfig.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{key}</p>
                    <p className={`text-xs ${healthConfig.color} capitalize`}>
                      {status}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Key Metrics */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(currentMetrics.responseTime)}ms</p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Server className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(currentMetrics.cpuUsage)}%</p>
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(currentMetrics.memoryUsage)}%</p>
                  <p className="text-sm text-muted-foreground">Memory Usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(currentMetrics.activeUsers)}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value: number) => [`${Math.round(value)}ms`, 'Response Time']}
                />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value: number) => [`${Math.round(value)}%`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpuUsage" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="memoryUsage" 
                  stackId="1"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-600">Performance Gains</h4>
              </div>
              <ul className="text-sm space-y-1">
                <li>• Response time improved by 15% this week</li>
                <li>• Database query optimization reduced load by 22%</li>
                <li>• Cache hit rate increased to 94%</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-600">Areas for Improvement</h4>
              </div>
              <ul className="text-sm space-y-1">
                <li>• Memory usage trending upward</li>
                <li>• Consider implementing CDN for static assets</li>
                <li>• Schedule database maintenance for optimal performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
