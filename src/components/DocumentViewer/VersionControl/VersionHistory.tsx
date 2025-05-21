
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Clock, Download, Eye } from "lucide-react";
import { DocumentVersion } from "../types";

interface VersionHistoryProps {
  versions: DocumentVersion[];
  currentVersion: DocumentVersion | null;
  onViewVersion: (version: DocumentVersion) => void;
  onDownloadVersion?: (version: DocumentVersion) => void;
  onCompareVersions?: (current: DocumentVersion, previous: DocumentVersion) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersion,
  onViewVersion,
  onDownloadVersion,
  onCompareVersions
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Version History</h3>
        
        <div className="space-y-3">
          {versions.map((version, index) => {
            const isActive = currentVersion?.id === version.id;
            const previousVersion = index < versions.length - 1 ? versions[index + 1] : null;
            
            return (
              <div
                key={version.id}
                className={`p-3 border rounded-md ${
                  isActive ? 'bg-primary/10 border-primary/20' : 'bg-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">
                      Version {version.version_number}
                      {version.is_current && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(version.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onViewVersion(version)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {onDownloadVersion && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => onDownloadVersion(version)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {version.changes_summary && (
                  <p className="text-xs mt-2">{version.changes_summary}</p>
                )}
                
                {previousVersion && onCompareVersions && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onCompareVersions(version, previousVersion)}
                    >
                      Compare with v{previousVersion.version_number}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {versions.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No versions available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
