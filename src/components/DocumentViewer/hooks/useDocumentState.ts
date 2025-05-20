import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DocumentDetails } from "../types";
import { 
  toString,
  toRecord,
  toSafeArray,
  toSafeComment
} from "@/utils/typeSafetyUtils";

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
      
      const { data: docData, error: docError } = await supabase
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
      
      if (!docData) {
        console.error("Document not found");
        setLoadingError("Document not found. It may have been deleted or moved.");
        return;
      }
      
      // Create a complete document object with safe type handling
      const documentData: DocumentDetails = {
        id: toString(docData.id),
        title: toString(docData.title),
        type: toString(docData.type),
        created_at: toString(docData.created_at),
        updated_at: toString(docData.updated_at),
        storage_path: toString(docData.storage_path),
        // Add missing properties needed by DocumentDetails interface
        versions: [],
        tasks: [],
        comments: []
      };
      
      // Safely process analysis data
      if (docData.analysis && Array.isArray(docData.analysis) && docData.analysis.length > 0) {
        const analysisItem = docData.analysis[0];
        
        if (analysisItem && typeof analysisItem === 'object' && analysisItem !== null) {
          const content = analysisItem.content;
          
          if (content && typeof content === 'object') {
            documentData.analysis = [{ 
              id: toString(analysisItem.id || ''), 
              content: content
            }];
            
            // Set debug info if available
            if (content && 'debug_info' in content) {
              setDebugInfo(content.debug_info);
            }
            
            // Check if analysis data is incomplete
            const hasExtractedInfo = content && 'extracted_info' in content;
            const hasRisks = content && 'risks' in content;
            
            if (!hasExtractedInfo && !hasRisks) {
              setAnalysisError("Analysis data is incomplete or malformed");
            } else {
              setAnalysisError(null);
            }
          } else {
            setAnalysisError("Analysis content is not in the expected format");
          }
        } else {
          setAnalysisError("Analysis data is missing or malformed");
        }
      } else {
        setAnalysisError("No analysis data found for this document");
      }
      
      // Process comments safely with document_id
      if (docData.comments && Array.isArray(docData.comments)) {
        documentData.comments = docData.comments.map(comment => 
          toSafeComment({
            id: toString(comment.id),
            content: toString(comment.content),
            created_at: toString(comment.created_at),
            user_id: toString(comment.user_id)
          }, documentId)
        );
      }

      setDocument(documentData);
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
      
      // Safely determine form type from the document title
      let formType = null;
      const title = toString(document.title).toLowerCase();
      if (title.includes('form 31') || title.includes('proof of claim')) {
        formType = 'form-31';
      } else if (title.includes('form 47') || title.includes('consumer proposal')) {
        formType = 'form-47';
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
