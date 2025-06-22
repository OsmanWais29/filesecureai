
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2 } from "lucide-react";

interface UploadProgressDisplayProps {
  uploadProgress: number;
  uploadStep: string;
}

export const UploadProgressDisplay: React.FC<UploadProgressDisplayProps> = ({ 
  uploadProgress, 
  uploadStep 
}) => {
  const isComplete = uploadProgress >= 100;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {isComplete ? (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          ) : (
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          )}
          
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>{uploadStep}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            {isComplete ? "Upload completed successfully!" : "Please wait while we process your document..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
