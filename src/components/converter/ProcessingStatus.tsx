
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProcessingStatus as ProcessingStatusType } from './types';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  const getStatusIcon = (stageStatus: string) => {
    switch (stageStatus) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (stageStatus: string) => {
    switch (stageStatus) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(status.overallProgress)}%</span>
          </div>
          <Progress value={status.overallProgress} className="h-2" />
        </div>

        <div className="space-y-3">
          {status.stages.map((stage) => (
            <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(stage.status)}
                <div>
                  <div className="font-medium">{stage.name}</div>
                  {stage.message && (
                    <div className="text-sm text-gray-600">{stage.message}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(stage.status)}>
                  {stage.status}
                </Badge>
                <span className="text-sm text-gray-500">{stage.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        {status.errors.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="font-medium text-red-800 mb-2">Errors:</div>
            {status.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600">{error}</div>
            ))}
          </div>
        )}

        {status.warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="font-medium text-yellow-800 mb-2">Warnings:</div>
            {status.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-600">{warning}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
