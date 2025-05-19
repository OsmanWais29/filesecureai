
import React from 'react';
import { formatDate } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Eye } from 'lucide-react';
import { DocumentVersion } from '../types';

interface VersionHistoryProps {
  versions: DocumentVersion[];
  onSelectVersion: (version: DocumentVersion) => void;
  onCompare: (current: DocumentVersion, previous: DocumentVersion) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  onSelectVersion,
  onCompare
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Version History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.length > 0 ? (
          <div className="space-y-4">
            {versions.map((version, index) => {
              // Determine if there's a previous version for comparison
              const hasPreviousVersion = index < versions.length - 1;
              const previousVersion = hasPreviousVersion ? versions[index + 1] : null;
              
              return (
                <div key={version.id} className="p-4 border rounded-lg bg-card hover:bg-accent/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Version {version.version_number}</h3>
                        {version.is_current && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectVersion(version)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      
                      {hasPreviousVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCompare(version, previousVersion!)}
                        >
                          Compare
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {version.changes && version.changes.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                      <p className="font-medium">Changes:</p>
                      <ul className="list-disc list-inside">
                        {version.changes.slice(0, 2).map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                        {version.changes.length > 2 && (
                          <li>...and {version.changes.length - 2} more changes</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No version history available for this document
          </div>
        )}
      </CardContent>
    </Card>
  );
};
