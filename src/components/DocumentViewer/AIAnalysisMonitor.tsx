
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { monitorAnalysisProgress } from '@/utils/documents/api/analysisApi';
import { safeStringCast } from '@/utils/typeGuards';

interface AIAnalysisMonitorProps {
  documentId: string;
  onComplete?: () => void;
}

export const AIAnalysisMonitor: React.FC<AIAnalysisMonitorProps> = ({
  documentId,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const result = await monitorAnalysisProgress(documentId);
        setProgress(result.progress);
        setStatus(safeStringCast(result.status));
        if (result.error) {
          setError(safeStringCast(result.error));
        }
        
        if (result.status === 'complete' && onComplete) {
          onComplete();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const interval = setInterval(checkProgress, 2000);
    checkProgress();

    return () => clearInterval(interval);
  }, [documentId, onComplete]);

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getStatusIcon()}
          AI Analysis Progress
          <Badge variant={getStatusColor() as any}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={progress} className="w-full" />
          <div className="text-xs text-muted-foreground">
            {progress}% complete
          </div>
          {error && (
            <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
