
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Pause,
  Play
} from 'lucide-react';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';

interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  status: 'active' | 'warning' | 'critical' | 'normal';
  lastUpdated: Date;
}

export const RealTimeMetrics: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([
    {
      id: 'active_users',
      label: 'Active Users',
      value: 24,
      change: +3,
      status: 'active',
      lastUpdated: new Date()
    },
    {
      id: 'docs_processing',
      label: 'Documents Processing',
      value: 8,
      change: -2,
      status: 'normal',
      lastUpdated: new Date()
    },
    {
      id: 'queue_size',
      label: 'Queue Size',
      value: 12,
      change: +5,
      status: 'warning',
      lastUpdated: new Date()
    },
    {
      id: 'avg_response_time',
      label: 'Avg Response Time (ms)',
      value: 847,
      change: -125,
      status: 'normal',
      lastUpdated: new Date()
    }
  ]);

  const analytics = useEnhancedAnalytics();

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 4,
        change: (Math.random() - 0.5) * 10,
        lastUpdated: new Date()
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const toggleLive = () => {
    setIsLive(!isLive);
    analytics.trackInteraction('RealTimeMetrics', 'ToggleLive', { isLive: !isLive });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Real-Time Monitoring</h2>
          <Badge variant={isLive ? 'default' : 'secondary'} className="gap-1">
            <Activity className={`h-3 w-3 ${isLive ? 'animate-pulse' : ''}`} />
            {isLive ? 'Live' : 'Paused'}
          </Badge>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleLive}
          className="gap-2"
        >
          {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isLive ? 'Pause' : 'Resume'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`gap-1 ${getStatusColor(metric.status)}`}
                >
                  {getStatusIcon(metric.status)}
                  {metric.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metric.value).toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${
                  metric.change > 0 ? 'text-green-600' : 
                  metric.change < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metric.change > 0 ? '+' : ''}{Math.round(metric.change)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {metric.lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Document Processing: Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">AI Analysis: Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Storage: 78% Capacity</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
