
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/dateUtils";
import { VersionComparisonProps } from "./types";

export const ComparisonView: React.FC<VersionComparisonProps> = ({
  currentVersion,
  previousVersion
}) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Version Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Current Version ({currentVersion.version_number})</h3>
            <p className="text-muted-foreground text-xs">
              Created on {formatDate(currentVersion.created_at)}
            </p>
            <p className="mt-1">{currentVersion.description || "No description provided."}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Previous Version ({previousVersion.version_number})</h3>
            <p className="text-muted-foreground text-xs">
              Created on {formatDate(previousVersion.created_at)}
            </p>
            <p className="mt-1">{previousVersion.description || "No description provided."}</p>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">Changes Summary</h3>
          <p>{currentVersion.changes_summary || "No changes summary provided."}</p>
        </div>
      </CardContent>
    </Card>
  );
};
