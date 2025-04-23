
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePreviewState from "./hooks/usePreviewState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PDFViewer } from "./components/PDFViewer";

interface DocumentPreviewProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  showControls?: boolean;
  bypassAnalysis?: boolean;
  onAnalysisComplete?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  storagePath,
  documentId = "",
  title = "Document Preview",
  showControls = true,
  bypassAnalysis = false,
  onAnalysisComplete
}) => {
  const {
    fileUrl,
    fileExists,
    previewError,
    analyzing,
    error,
    analysisStep,
    progress,
    isLoading,
    handleAnalysisRetry,
    fileType,
  } = usePreviewState(storagePath, documentId, title, onAnalysisComplete, bypassAnalysis);

  // Manual trigger for document analysis
  const handleAnalyzeDocument = async () => {
    try {
      console.log("Manually triggering document analysis for:", documentId);
      
      if (!documentId) {
        throw new Error("Document ID is required for analysis");
      }
      
      // Call the edge function
      const { error } = await supabase.functions.invoke("process-document", {
        body: { documentId, storagePath }
      });
      
      if (error) throw error;
      
      // Notify user
      alert("Document analysis started successfully!");
      
      // If callback provided, trigger it
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
      
    } catch (error) {
      console.error("Error triggering document analysis:", error);
      alert(`Failed to analyze document: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-10">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Loading document preview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (previewError) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Document</AlertTitle>
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
          <div className="flex flex-col items-center justify-center p-10 space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              We encountered an issue loading this document.
            </p>
            
            {showControls && (
              <div className="flex space-x-2">
                <Button onClick={handleAnalysisRetry}>
                  Retry Loading Document
                </Button>
                <Button variant="outline" onClick={handleAnalyzeDocument}>
                  Force Document Analysis
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fileExists || !fileUrl) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-10">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-10 w-10 text-warning" />
            <p>Document file not found.</p>
            {showControls && (
              <Button onClick={handleAnalysisRetry}>Retry</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // For PDF files, use the PDF viewer component
  if (fileType === 'application/pdf' || fileUrl.endsWith('.pdf')) {
    return <PDFViewer fileUrl={fileUrl} title={title} />;
  }

  // For other file types, provide a download link
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center p-10 space-y-4">
          <FileText className="h-16 w-16 text-primary" />
          <p className="text-center">
            This file type cannot be previewed directly.
          </p>
          <div className="flex space-x-2">
            <Button asChild>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Open in New Tab
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={fileUrl} download>
                Download File
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
