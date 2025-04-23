
import { FileText, FileQuestion, Download, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Document } from "../../types";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PDFViewerEmbed } from "./PDFViewerEmbed";
import { supabase } from "@/lib/supabase";

// Define the proper props interface matching the parent component's usage
export interface DocumentPreviewTabProps {
  document: Document;
  hasStoragePath: boolean;
  effectiveDocumentId: string;
  getStoragePath: () => string;
  handleDocumentOpen: () => void;
  isLoading: boolean;
}

export const DocumentPreviewTab: React.FC<DocumentPreviewTabProps> = ({
  document,
  hasStoragePath,
  effectiveDocumentId,
  getStoragePath,
  handleDocumentOpen,
  isLoading
}) => {
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState<boolean>(false);
  
  // Extract storage path and check if it's a PDF
  const storagePath = document.metadata?.storage_path || null;
  const isPdf = storagePath?.toLowerCase().endsWith('.pdf') || false;
  
  // When component mounts, try to get the PDF URL
  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (hasStoragePath && storagePath && isPdf) {
        try {
          setFetchingUrl(true);
          const { data, error } = await supabase.storage
            .from("documents")
            .createSignedUrl(storagePath, 3600);
            
          if (error) throw error;
          
          if (data?.signedUrl) {
            setPdfUrl(data.signedUrl);
            setPreviewError(false);
          }
        } catch (err) {
          console.error("Error getting PDF URL:", err);
          setPreviewError(true);
          // Try fallback to public URL
          try {
            const { data: publicUrlData } = supabase.storage
              .from("documents")
              .getPublicUrl(storagePath);
              
            if (publicUrlData?.publicUrl) {
              setPdfUrl(publicUrlData.publicUrl);
              setPreviewError(false);
            }
          } catch (fallbackErr) {
            console.error("Fallback URL error:", fallbackErr);
            setPreviewError(true);
          }
        } finally {
          setFetchingUrl(false);
        }
      }
    };
    
    fetchPdfUrl();
  }, [hasStoragePath, storagePath, isPdf]);
  
  const handlePreviewError = () => {
    console.log("Preview error encountered in DocumentPreviewTab");
    setPreviewError(true);
    toast.error("Could not load document preview");
  };
  
  const handleDownload = () => {
    if (pdfUrl) {
      // Use the global window.document instead of the document prop
      const link = window.document.createElement('a');
      link.href = pdfUrl;
      link.download = document.title || 'document.pdf';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      toast.success("Download started");
    } else {
      toast.error("Download URL not available");
    }
  };

  return (
    <>
      {hasStoragePath && !previewError ? (
        isPdf && pdfUrl ? (
          // Show PDF preview for PDF files
          <div className="h-64 overflow-hidden rounded-md border relative">
            <PDFViewerEmbed 
              fileUrl={pdfUrl}
              title={document.title}
              onError={handlePreviewError}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button 
                variant="secondary" 
                size="sm" 
                className="mr-2"
                onClick={handleDocumentOpen}
                disabled={isLoading || fetchingUrl}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {isLoading || fetchingUrl ? 'Loading...' : 'Open'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                disabled={fetchingUrl || !pdfUrl}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          // Show document card for non-PDF files
          <div className="h-64 overflow-hidden rounded-md border relative group">
            <div 
              className="absolute inset-0 cursor-pointer z-10"
              onClick={handleDocumentOpen}
              title="Click to open document viewer"
            />
            
            <div className="flex items-center justify-center h-full bg-muted/30">
              <div className="text-center p-4">
                <FileText className="h-12 w-12 mx-auto text-primary/60 mb-3" />
                <h3 className="font-medium text-sm mb-1">{document.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Click to open document
                </p>
              </div>
            </div>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button 
                variant="secondary" 
                size="sm" 
                className="mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDocumentOpen();
                }}
                disabled={isLoading}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {isLoading ? 'Opening...' : 'Open'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )
      ) : (
        <div className="bg-muted rounded-md p-8 h-64 flex flex-col items-center justify-center">
          {previewError ? (
            <>
              <FileQuestion className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                There was an error loading the document preview.
              </p>
            </>
          ) : fetchingUrl ? (
            <>
              <FileText className="h-10 w-10 text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground text-center mb-4">
                Loading document preview...
              </p>
            </>
          ) : (
            <>
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Document preview not available.
              </p>
            </>
          )}
          <Button 
            variant="default" 
            className="mt-2"
            onClick={handleDocumentOpen}
            disabled={isLoading}
          >
            {isLoading ? 'Opening...' : 'Open in Document Viewer'}
          </Button>
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Document Information</h4>
        <Card>
          <CardContent className="p-3 text-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-muted-foreground">Type:</div>
              <div>{document.type || 'Unknown'}</div>
              
              <div className="text-muted-foreground">Updated:</div>
              <div>{new Date(document.updated_at).toLocaleDateString()}</div>
              
              <div className="text-muted-foreground">Created:</div>
              <div>{new Date(document.created_at).toLocaleDateString()}</div>
              
              <div className="text-muted-foreground">ID:</div>
              <div className="truncate" title={document.id}>{document.id}</div>
              
              {document.metadata && document.metadata.formNumber && (
                <>
                  <div className="text-muted-foreground">Form Number:</div>
                  <div>{document.metadata.formNumber}</div>
                </>
              )}
            </div>
            
            <p className="mt-3">
              This document appears to be a {document.type || 'standard document'} related to client {document.title.includes('Form') ? 'financial information' : 'case details'}.
            </p>
            <p className="mt-2 text-muted-foreground text-xs">AI summary is a preview feature and may not be accurate.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
