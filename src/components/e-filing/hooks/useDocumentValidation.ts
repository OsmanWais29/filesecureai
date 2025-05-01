
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Document } from "@/components/DocumentList/types";
import { ValidationResult, RiskItem } from "../types";

export function useDocumentValidation(
  document: Document | null,
  onValidationComplete: (isValid: boolean) => void
) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'failed' | 'passed'>('pending');
  const [retryCount, setRetryCount] = useState(0);
  const [lastAnalysisAttempt, setLastAnalysisAttempt] = useState<Date | null>(null);

  // Function to check if document has analysis results
  const checkExistingAnalysis = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_analysis')
        .select('content')
        .eq('document_id', documentId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data?.content) {
        console.log("Found existing analysis for document:", documentId);
        processAnalysisResults(data.content);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for existing analysis:", error);
      return false;
    }
  };

  // Process analysis results to extract validations and risks
  const processAnalysisResults = (analysisData: any) => {
    try {
      console.log("Processing analysis results:", analysisData);
      
      // Extract risks
      if (analysisData.risks && Array.isArray(analysisData.risks)) {
        setRisks(analysisData.risks);
      }
      
      // Create validation results
      const processedValidations: ValidationResult[] = [
        {
          id: 'structure',
          title: 'Document Structure',
          status: analysisData.regulatory_compliance?.status === 'compliant' ? 'success' : 'warning',
          description: analysisData.regulatory_compliance?.details || 'Document structure analysis completed'
        },
        {
          id: 'fields',
          title: 'Required Fields',
          status: analysisData.extracted_info && Object.keys(analysisData.extracted_info).length > 3 ? 'success' : 'warning',
          description: analysisData.extracted_info?.summary || 'Required fields extraction completed'
        },
        {
          id: 'signatures',
          title: 'Signatures',
          status: analysisData.risks?.some((r: RiskItem) => 
            r.type.toLowerCase().includes('signature') && r.severity === 'high'
          ) ? 'error' : 'success',
          description: 'Signature verification completed'
        }
      ];

      setValidations(processedValidations);
      
      // Determine overall status
      const hasHighRisks = analysisData.risks?.some((r: RiskItem) => r.severity === 'high');
      const overallResult = hasHighRisks ? 'failed' : 'passed';
      
      setOverallStatus(overallResult);
      onValidationComplete(!hasHighRisks);
      
      // Show appropriate notification
      if (hasHighRisks) {
        toast.warning("Document validation found high-risk issues. Please review the risks.");
      } else {
        toast.success("Document validation successful!");
      }
    } catch (error) {
      console.error("Error processing analysis results:", error);
      setOverallStatus('failed');
      onValidationComplete(false);
    }
  };

  // Main function to perform document analysis
  const performDocumentAnalysis = async () => {
    if (!document || !document.id) return;

    setIsAnalyzing(true);
    setLastAnalysisAttempt(new Date());
    
    try {
      // First check if analysis already exists
      const hasExistingAnalysis = await checkExistingAnalysis(document.id);
      if (hasExistingAnalysis) {
        setIsAnalyzing(false);
        return;
      }
      
      // Call the Supabase Edge Function for document analysis
      console.log(`Calling process-ai-request for document: ${document.id}`);
      
      const { data, error } = await supabase.functions.invoke('process-ai-request', {
        body: {
          documentId: document.id,
          includeRegulatory: true,
          includeClientExtraction: true,
          title: document.title || ''
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      if (data) {
        console.log("Received analysis result:", data);
        processAnalysisResults(data);
      } else {
        throw new Error("No data returned from analysis");
      }
    } catch (error: any) {
      console.error('Document analysis error:', error);
      toast.error(`Analysis error: ${error.message || "Unknown error"}`);
      
      // Set failed status
      setOverallStatus('failed');
      onValidationComplete(false);
      
      // Add a basic validation result for the error
      setValidations([{
        id: 'analysis-error',
        title: 'Analysis Error',
        status: 'error',
        description: `Failed to analyze document: ${error.message || "Unknown error"}`
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (document) {
      // If we have a document, trigger analysis after a short delay to ensure UI is ready
      const timer = setTimeout(() => {
        performDocumentAnalysis();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [document, retryCount]);

  // Function to manually retry analysis
  const retryAnalysis = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    isAnalyzing,
    validations,
    risks,
    overallStatus,
    retryAnalysis,
    performDocumentAnalysis
  };
}
