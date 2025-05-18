import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useDocument } from "@/hooks/useDocument";
import { useDocumentAI } from "../useDocumentAI";
import { useAnalysisInitialization } from "../useAnalysisInitialization";
import { extractRisksFromAnalysis, processExtractedInfo, generateAnalysisSection } from "./stages/riskAssessment";
import { updateAnalysisStatus } from "./documentStatusUpdates";
import { DocumentRecord } from "../types";

export const useAnalysisProcess = (documentId: string, storage_path: string) => {
  const { toast } = useToast();
  const { document: documentRecord } = useDocument(documentId);
  const { setAiProcessingStatus } = useDocumentAI(documentId, storage_path);
  const { initializeProcessingSteps, processingSteps, setProcessingSteps } = useAnalysisInitialization(documentId, storage_path);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);

  const startAnalysis = useCallback(async () => {
    if (!documentId || !storage_path || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisStep(null);

    try {
      // Initialize processing steps
      await initializeProcessingSteps();
      setAiProcessingStatus('processing');

      // Start the analysis process
      await processDocumentAnalysis();
    } catch (error: any) {
      console.error("Analysis process failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze document."
      });
      setAiProcessingStatus('failed');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(null);
    }
  }, [documentId, storage_path, isAnalyzing, initializeProcessingSteps, setAiProcessingStatus, toast]);

  const processDocumentAnalysis = useCallback(async () => {
    if (!documentRecord) return;

    const initialSteps = ['extract_text', 'analyze_content', 'extract_metadata', 'assess_risks', 'generate_summary'];
    setProcessingSteps(initialSteps);

    for (const step of initialSteps) {
      setAnalysisStep(step);
      try {
        await updateAnalysisStatus(documentRecord, 'processing', step);

        let analysisResults;
        switch (step) {
          case 'extract_text':
            analysisResults = await extractTextFromDocument(documentRecord);
            break;
          case 'analyze_content':
            analysisResults = await analyzeDocumentContent(documentRecord);
            break;
          case 'extract_metadata':
            analysisResults = await extractDocumentMetadata(documentRecord);
            break;
          case 'assess_risks':
            analysisResults = await assessDocumentRisks(documentRecord);
            break;
          case 'generate_summary':
            analysisResults = await generateDocumentSummary(documentRecord);
            break;
          default:
            throw new Error(`Unknown analysis step: ${step}`);
        }

        await saveAnalysisResult(analysisResults);
      } catch (error: any) {
        console.error(`Step ${step} failed:`, error);
        toast({
          variant: "destructive",
          title: `Analysis Step Failed: ${step}`,
          description: error.message || `Failed to complete step ${step}.`
        });
        setAiProcessingStatus('failed');
        return;
      }
    }

    setAiProcessingStatus('completed');
    toast({
      title: "Analysis Complete",
      description: "Document analysis completed successfully."
    });
  }, [documentRecord, setAiProcessingStatus, setProcessingSteps, toast]);

  const extractTextFromDocument = async (documentRecord: DocumentRecord) => {
    // Placeholder for text extraction logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { text: "Extracted text from document" };
  };

  const analyzeDocumentContent = async (documentRecord: DocumentRecord) => {
    // Placeholder for content analysis logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { content: "Analyzed document content" };
  };

  const extractDocumentMetadata = async (documentRecord: DocumentRecord) => {
    // Placeholder for metadata extraction logic
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { metadata: { author: "AI", created: new Date() } };
  };

  const assessDocumentRisks = async (documentRecord: DocumentRecord) => {
    // Simulate risk assessment
    await new Promise(resolve => setTimeout(resolve, 1800));
    const analysisData = {
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
    };

    const risks = extractRisksFromAnalysis(analysisData);
    const extractedInfo = processExtractedInfo(analysisData);
    const analysisSection = generateAnalysisSection(analysisData);

    return {
      risks,
      extractedInfo,
      analysisSection
    };
  };

  const generateDocumentSummary = async (documentRecord: DocumentRecord) => {
    // Placeholder for summary generation logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { summary: "Generated document summary" };
  };

  const saveAnalysisResult = async (analysisResults: any) => {
    if (!analysisResults || !documentId) return;

    try {
      // Make sure we're spreading an object, not an unknown type
      const analysisContent = analysisResults && typeof analysisResults === 'object' 
        ? { ...analysisResults } 
        : { data: analysisResults };

      const { data, error } = await supabase
        .from('document_analysis')
        .insert({
          document_id: documentId,
          content: analysisContent
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Analysis Saved",
        description: "Analysis results saved successfully."
      });
    } catch (error: any) {
      console.error("Error saving analysis results:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save analysis results."
      });
    }
  };

  return {
    startAnalysis,
    isAnalyzing,
    analysisStep,
    processingSteps
  };
};
