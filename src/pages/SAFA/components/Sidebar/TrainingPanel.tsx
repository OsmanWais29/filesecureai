
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Brain, Sparkles } from "lucide-react";
import { TrainingUpload } from "../TrainingUpload";

interface TrainingPanelProps {
  isCollapsed?: boolean;
}

export const TrainingPanel: React.FC<TrainingPanelProps> = ({ isCollapsed = false }) => {
  const [showUpload, setShowUpload] = useState(false);

  if (isCollapsed) {
    return (
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 flex items-center justify-center"
          onClick={() => setShowUpload(true)}
        >
          <Brain className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {showUpload ? (
        <TrainingUpload onClose={() => setShowUpload(false)} />
      ) : (
        <Card className="border-0 shadow-none bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900">
              <Brain className="h-4 w-4 text-green-600" />
              Train AI
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Upload your firm's documents to improve AI responses and make them more specific to your practice.
            </p>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileText className="h-3 w-3" />
                <span>Legal documents</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                <span>Form templates</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowUpload(true)}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="h-3 w-3 mr-2" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
