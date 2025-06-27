
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { getPerformanceMeasurements, getAnomalyThresholds } from '@/utils/performanceMonitor';

interface AnomalyDataItem {
  name: string;
  value: number;
  threshold: number;
  isAnomaly: boolean;
}

interface ThresholdDataItem {
  name: string;
  mean: number;
  upperBound: number;
  lowerBound: number;
}

export const AnomalyDetectionDashboard = () => {
  const [anomalyData, setAnomalyData] = useState<AnomalyDataItem[]>([]);
  const [thresholdData, setThresholdData] = useState<ThresholdDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format performance data for charts - memoized to prevent recalculation on each render
  const getFormattedPerformanceData = useMemo(() => {
    const measurements = getPerformanceMeasurements();
    const thresholds = getAnomalyThresholds();
    
    return {
      anomalyData: Object.entries(measurements).map(([key, value]) => {
        const numValue = typeof value === 'number' ? value : 0;
        const threshold = thresholds[key] || { mean: 0, stdDev: 0 };
        const thresholdValue = threshold.mean + (2 * threshold.stdDev);
        
        return {
          name: key.replace(/-/g, ' ').replace(/^./, str => str.toUpperCase()),
          value: Math.round(numValue),
          threshold: Math.round(thresholdValue),
          isAnomaly: numValue > thresholdValue
        };
      }),
      thresholdData: Object.entries(thresholds).map(([key, { mean, stdDev }]) => ({
        name: key.replace(/-/g, ' ').replace(/^./, str => str.toUpperCase()),
        mean: Math.round(mean),
        upperBound: Math.round(mean + (2 * stdDev)),
        lowerBound: Math.round(Math.max(0, mean - (2 * stdDev)))
      }))
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { anomalyData, thresholdData } = getFormattedPerformanceData;
        
        setAnomalyData(anomalyData);
        setThresholdData(thresholdData);
      } catch (error) {
        console.error('Error loading performance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Set up an interval to refresh the data every 30 seconds
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, [getFormattedPerformanceData]);

  // Filter only anomalies for the anomalies chart
  const anomaliesOnly = useMemo(() => 
    anomalyData.filter(item => item.isAnomaly), 
    [anomalyData]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading performance metrics...</p>
      </div>
    );
  }

  // If no anomalies detected, show a message
  if (anomaliesOnly.length === 0 && anomalyData.length > 0) {
    return (
      <div className="py-8 text-center">
        <h3 className="text-lg font-medium text-green-600">No performance anomalies detected!</h3>
        <p className="text-muted-foreground mt-2">All systems are running within expected parameters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {anomaliesOnly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Performance Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
                <BarChart data={anomaliesOnly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'value') return [`${value}ms`, 'Actual'];
                      if (name === 'threshold') return [`${value}ms`, 'Threshold'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="threshold" name="Expected Threshold" fill="#8884d8" opacity={0.5} />
                  <Bar dataKey="value" name="Actual Time (ms)" fill="#ff6b6b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Performance Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
              <BarChart data={thresholdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}ms`, 'Time']}
                />
                <Legend />
                <Bar dataKey="mean" name="Average (ms)" fill="#82ca9d" />
                <Bar dataKey="upperBound" name="Upper Threshold (ms)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
