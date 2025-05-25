
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
        <div className="p-4 border-b bg-muted/10">
          <h3 className="text-lg font-semibold text-foreground">File Preview</h3>
          <p className="text-sm text-muted-foreground">Select a document to preview</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No document selected</p>
            <p className="text-sm">Choose a document from the list to see its details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/10">
        <h3 className="text-lg font-semibold text-foreground">File Preview</h3>
        <p className="text-sm text-muted-foreground">Document details and preview</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Document Header */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate text-foreground">
                    {document.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {document.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 ml-3">
                  <FileText className="h-6 w-6 text-primary" />
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
                  <Eye className="h-4 w-4 mr-2" />
                  Open Document
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(document.created_at).split(' at ')[0]}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Modified
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(document.updated_at).split(' at ')[0]}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <FileType className="h-4 w-4 mr-2" />
                    Size
                  </span>
                  <span className="font-medium text-foreground">2.3 MB</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Status
                  </span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Complete
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Preview Placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Quick Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Document Preview</p>
                  <p className="text-xs mt-1">Click "Open Document" to view</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Comments & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-6">
                <p className="text-sm">No comments yet</p>
                <Button variant="link" className="text-sm mt-2 p-0 h-auto text-primary">
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
