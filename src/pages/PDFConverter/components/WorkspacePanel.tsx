
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { FileText, ZoomIn, ZoomOut, RotateCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExtractedField {
  name: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  editable: boolean;
  aiSuggestion?: string;
}

interface ProcessingStatus {
  stage: string;
  progress: number;
  message: string;
}

interface WorkspacePanelProps {
  uploadedFile: File | null;
  extractedFields: ExtractedField[];
  processingStatus: ProcessingStatus | null;
  isProcessing: boolean;
  onFieldUpdate: (fieldName: string, value: string) => void;
  aiAutoMapping: boolean;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  uploadedFile,
  extractedFields,
  processingStatus,
  isProcessing,
  onFieldUpdate,
  aiAutoMapping
}) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (!uploadedFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No Document Uploaded</h3>
            <p className="text-muted-foreground">Upload a PDF to start the conversion process</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* PDF Preview Panel */}
      <div className="flex-1 flex flex-col border-r">
        <div className="border-b p-4 flex items-center justify-between">
          <h3 className="font-medium">PDF Preview</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">100%</span>
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          {isProcessing ? (
            <div className="text-center space-y-4">
              <Progress value={processingStatus?.progress || 0} className="w-64" />
              <div>
                <p className="font-medium">{processingStatus?.stage || 'Processing...'}</p>
                <p className="text-sm text-muted-foreground">{processingStatus?.message}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground">PDF preview will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Field Mapping Panel */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Extracted Fields</h3>
            {aiAutoMapping && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                AI Auto-Mapping ON
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {extractedFields.length === 0 && !isProcessing ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No fields extracted yet. Upload a document to begin.</p>
              </div>
            ) : (
              extractedFields.map((field, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{field.name}</Label>
                      <Badge className={getConfidenceColor(field.confidence)}>
                        {getConfidenceIcon(field.confidence)}
                        <span className="ml-1 capitalize">{field.confidence}</span>
                      </Badge>
                    </div>
                    
                    <Input
                      value={field.value}
                      onChange={(e) => onFieldUpdate(field.name, e.target.value)}
                      disabled={!field.editable}
                      className={field.confidence === 'low' ? 'border-red-300' : ''}
                    />
                    
                    {field.aiSuggestion && (
                      <div className="bg-blue-50 p-2 rounded-md">
                        <p className="text-xs text-blue-600 font-medium">AI Suggestion:</p>
                        <p className="text-sm text-blue-800">{field.aiSuggestion}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
