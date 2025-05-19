
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/utils/dateUtils';
import { VersionComparisonProps } from './types';

export const ComparisonView: React.FC<VersionComparisonProps> = ({
  currentVersion,
  previousVersion
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Version Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Previous Version</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Version {previousVersion.version_number} - Created at {formatDate(previousVersion.createdAt)}
            </p>
            <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96">
              {JSON.stringify(previousVersion.content, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Current Version</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Version {currentVersion.version_number} - Created at {formatDate(currentVersion.createdAt)}
            </p>
            <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96">
              {JSON.stringify(currentVersion.content, null, 2)}
            </pre>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-2">Changes Summary</h3>
          <div className="p-4 bg-muted rounded-md">
            {currentVersion.changes && Array.isArray(currentVersion.changes) && currentVersion.changes.length > 0 ? (
              <ul className="list-disc pl-4 space-y-2">
                {currentVersion.changes.map((change: string, index: number) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No detailed changes available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
