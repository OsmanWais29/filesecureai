
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Eye, Calendar, User, FileType } from "lucide-react";
import { Document } from "../../types";
import { formatDate } from "@/utils/formatDate";

interface FilePreviewPanelProps {
  document: Document | null;
  onDocumentOpen?: (documentId: string) => void;
}

export const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({ 
  document, 
  onDocumentOpen 
}) => {
  if (!document) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">File Preview</h3>
          <p className="text-sm text-muted-foreground">Select a document to preview</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No document selected</p>
            <p className="text-xs mt-1">Choose a document from the list to see its details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">File Preview</h3>
        <p className="text-sm text-muted-foreground">Document details and preview</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Document Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{document.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{document.type}</Badge>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </div>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => onDocumentOpen?.(document.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Open
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created
                </span>
                <span>{formatDate(document.created_at).split(' at ')[0]}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Modified
                </span>
                <span>{formatDate(document.updated_at).split(' at ')[0]}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <FileType className="h-4 w-4 mr-1" />
                  Size
                </span>
                <span>2.3 MB</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Status
                </span>
                <Badge className="bg-green-100 text-green-800">Complete</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Document Preview Placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Document preview</p>
                  <p className="text-xs mt-1">Click "Open" to view full document</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Comments & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-4">
                <p className="text-xs">No comments yet</p>
                <Button variant="link" className="text-xs mt-1 p-0 h-auto">
                  Add a comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
