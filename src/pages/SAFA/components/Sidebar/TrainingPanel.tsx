
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Brain, TrendingUp } from "lucide-react";

export const TrainingPanel = () => {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Training Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Upload className="h-4 w-4 mr-2" />
            Upload Training Data
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
