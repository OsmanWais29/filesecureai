
import { useState, useCallback, useEffect } from "react";
import { useDocumentDetails } from "./useDocumentDetails";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/lib/supabase";
import { triggerDocumentAnalysis } from "@/utils/documents/api/analysisApi";

export const useDocumentState = (documentId: string, documentTitle?: string) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  // Handle document details fetching
  const { fetchDocumentDetails } = useDocumentDetails(documentId, {
    onSuccess: (data) => {
      console.log("Document details loaded successfully:", data?.id);
      setDocument(data);
      setLoading(false);
      setLoadingError(null);
    },
    onError: (error) => {
      console.error("Error loading document:", error);
      
      // Special handling for Form 47 demo
      if (documentId === "form47" || documentTitle?.toLowerCase().includes("form 47")) {
        const form47Document = {
          id: "form47",
          title: documentTitle || "Form 47 - Consumer Proposal",
          type: "form",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          storage_path: "sample-documents/form-47-consumer-proposal.pdf",
          analysis: [
            {
              id: "form47-analysis-1",
              content: {
                extracted_info: {
                  formNumber: "47",
                  formType: "consumer-proposal",
                  summary: "This is a form used for consumer proposals under the Bankruptcy and Insolvency Act."
                },
                risks: [
                  {
                    type: "Missing Information",
                    description: "Please ensure all required fields are completed.",
                    severity: "medium"
                  }
                ]
              }
            }
          ],
          comments: []
        };
        
        setDocument(form47Document);
        setLoading(false);
        setLoadingError(null);
        return;
      }
      
      setLoading(false);
      setLoadingError(error.message || "Failed to load document");
      toast({
        variant: "destructive",
        title: "Document Loading Error",
        description: error.message || "Failed to load document"
      });
    }
  });

  // Trigger analysis API call for document
  const triggerAnalysis = useCallback(async () => {
    if (!document && !documentId) return;
    
    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      console.log("Triggering analysis for document:", documentId);
      
      // Update status in UI first
      sonnerToast.info("Starting document analysis...");
      
      // Call analysis API
      const result = await triggerDocumentAnalysis(documentId);
      
      // Reload document to get updated analysis
      await fetchDocumentDetails();
      
      sonnerToast.success("Document analysis completed");
      setAnalysisLoading(false);
      setAnalysisError(null);
      
      // Store debug info for development
      setDebugInfo({
        analysisResult: result,
        documentId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("Analysis error:", error);
      setAnalysisLoading(false);
      setAnalysisError(error.message || "Failed to analyze document");
      
      sonnerToast.error("Document analysis failed", {
        description: error.message || "Please try again later"
      });
    }
  }, [document, documentId, fetchDocumentDetails]);
  
  // Check for missing analysis when document loads
  useEffect(() => {
    if (document && (!document.analysis || document.analysis.length === 0)) {
      // If no analysis found and not already in error state, trigger automatic analysis
      if (!analysisError && !analysisLoading && documentId !== "form47") {
        console.log("No analysis found, triggering automatic analysis");
        setAnalysisError("Document has not been analyzed yet. Analyzing now...");
        triggerAnalysis();
      }
    }
  }, [document, analysisError, analysisLoading, documentId, triggerAnalysis]);

  return {
    document,
    loading,
    loadingError,
    analysisError,
    analysisLoading,
    debugInfo,
    fetchDocumentDetails,
    triggerAnalysis
  };
};
