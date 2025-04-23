
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DocumentDetails } from "../types";

export const useDocumentState = (documentId: string, documentTitle?: string) => {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      setLoadingError(null);
      
      console.log('Fetching document details for ID:', documentId);
      
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select(`
          *,
          analysis:document_analysis(content),
          comments:document_comments(id, content, created_at, user_id)
        `)
        .eq('id', documentId)
        .maybeSingle();

      if (docError) {
        console.error("Error fetching document:", docError);
        setLoadingError(`Failed to load document: ${docError.message}`);
        return;
      }
      
      if (!document) {
        console.error("Document not found");
        setLoadingError("Document not found. It may have been deleted or moved.");
        return;
      }
      
      if (!document.analysis || document.analysis.length === 0) {
        setAnalysisError("No analysis data found for this document");
      } else {
        setDebugInfo(document.analysis[0]?.content?.debug_info || null);
        
        const analysisContent = document.analysis[0]?.content;
        if (!analysisContent || (!analysisContent.extracted_info && !analysisContent.risks)) {
          setAnalysisError("Analysis data is incomplete or malformed");
        } else {
          setAnalysisError(null);
        }
      }

      setDocument(document);
    } catch (error: any) {
      console.error('Error fetching document details:', error);
      setLoadingError(`Failed to load document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      setAnalysisError(null);
      
      const { data: document } = await supabase
        .from('documents')
        .select('storage_path, title')
        .eq('id', documentId)
        .single();
        
      if (!document?.storage_path) {
        throw new Error("Document has no storage path");
      }
      
      toast({
        title: "Starting Document Analysis",
        description: "Please wait while we analyze your document...",
      });
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(document.storage_path);
        
      if (fileError) {
        throw new Error(`Failed to download document: ${fileError.message}`);
      }
      
      const textContent = await fileData.text();
      
      let formType = null;
      if (document.title) {
        const title = document.title.toLowerCase();
        if (title.includes('form 31') || title.includes('proof of claim')) {
          formType = 'form-31';
        } else if (title.includes('form 47') || title.includes('consumer proposal')) {
          formType = 'form-47';
        }
      }
      
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('process-ai-request', {
        body: {
          message: textContent,
          documentId: documentId,
          module: "document-analysis",
          formType: formType,
          title: document.title,
          debug: true
        }
      });
      
      if (analysisError) {
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }
      
      if (!analysisData) {
        throw new Error("Analysis service returned no data. Please check your OpenAI API key configuration.");
      }
      
      toast({
        title: "Analysis Complete",
        description: "Document has been successfully analyzed",
      });
      
      await fetchDocumentDetails();
      
    } catch (error: any) {
      console.error("Error triggering analysis:", error);
      setAnalysisError(`Failed to analyze document: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

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
