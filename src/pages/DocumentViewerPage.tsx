
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { EnhancedDocumentViewer } from "@/components/DocumentViewer/EnhancedDocumentViewer";
import { toast } from "sonner";
import { runFullSystemDiagnostics } from "@/utils/diagnoseBiaSystem";
import { SimplePDFViewer } from "@/components/PDFViewer/SimplePDFViewer";
import { supabase } from "@/lib/supabase";

const DocumentViewerPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [documentNotFound, setDocumentNotFound] = useState(false);
  const [documentTitle, setDocumentTitle] = useState<string>("Document Viewer");
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [isDirectPdf, setIsDirectPdf] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  
  useEffect(() => {
    if (!documentId) {
      toast.error("No document ID provided");
      navigate('/documents');
      return;
    }

    // Log the document ID being viewed
    console.log("Viewing document:", documentId);
    
    // Special case for Form 47 document - we'll provide a demo version
    if (documentId === "form47") {
      setDocumentTitle("Form 47 - Consumer Proposal");
      setIsDirectPdf(true);
      setStoragePath("sample-documents/form-47-consumer-proposal.pdf");
      setIsLoading(false);
      return;
    }
    
    // Fetch document details from Supabase
    const fetchDocumentDetails = async () => {
      try {
        const { data: document, error } = await supabase
          .from('documents')
          .select('title, storage_path, type')
          .eq('id', documentId)
          .single();
          
        if (error) {
          console.error("Error fetching document:", error);
          setDocumentNotFound(true);
          setIsLoading(false);
          return;
        }
        
        if (!document) {
          setDocumentNotFound(true);
          setIsLoading(false);
          return;
        }
        
        setDocumentTitle(document.title || "Untitled Document");
        setStoragePath(document.storage_path || null);
        setIsDirectPdf(document.type?.toLowerCase().includes('pdf') || false);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in document fetching:", error);
        setDocumentNotFound(true);
        setIsLoading(false);
      }
    };
    
    fetchDocumentDetails();
    
    // Run diagnostics if in development environment
    if (process.env.NODE_ENV === 'development') {
      runFullSystemDiagnostics(documentId).then(results => {
        console.log('System diagnostic results:', results);
        setDiagnosticResults(results);
        
        if (!results.success) {
          toast.warning("System diagnostic identified issues", {
            description: results.message,
            duration: 5000
          });
        }
      }).catch(err => {
        console.error("Diagnostics failed:", err);
      });
    }
  }, [documentId, navigate]);
  
  const handleBack = () => {
    navigate('/documents');
  };
  
  return (
    <MainLayout>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> 
          Back to Documents
        </Button>
      </div>
      
      <div className="h-[calc(100vh-8rem)]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : documentNotFound ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <h3 className="text-xl font-semibold mb-2">Document Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The document you requested could not be found. It may have been deleted or moved.
            </p>
            <Button onClick={handleBack}>Return to Documents</Button>
          </div>
        ) : isDirectPdf && storagePath ? (
          // Display PDF directly using SimplePDFViewer for PDF documents
          <div className="bg-white dark:bg-background h-full rounded-lg border shadow-sm">
            <SimplePDFViewer 
              storagePath={storagePath} 
              title={documentTitle} 
              className="h-full rounded-lg"
            />
          </div>
        ) : (
          // Use the full-featured document viewer for other document types
          <EnhancedDocumentViewer 
            documentId={documentId!}
            documentTitle={documentTitle}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default DocumentViewerPage;
