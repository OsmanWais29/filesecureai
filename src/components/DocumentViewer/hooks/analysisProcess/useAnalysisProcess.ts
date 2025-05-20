
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { AnalysisProcessContext } from "./types";
import { useRiskAssessment } from "./stages/riskAssessment";
import { toString } from "@/utils/typeSafetyUtils";

export const useAnalysisProcess = () => {
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("");

  const analyzeDocument = useCallback(
    async (
      documentId: string,
      documentText: string,
      metadata: Record<string, unknown> | null,
      onAnalysisComplete?: () => void
    ) => {
      try {
        setError(null);
        setProgress(0);
        setAnalysisStep("Starting document analysis...");
        console.log("Starting document analysis for:", documentId);

        // Extract form type from metadata if available
        const formType = metadata?.formType ? toString(metadata.formType) : "";
        const formNumber = metadata?.formNumber ? toString(metadata.formNumber) : "";
        
        // Detect if this is a specific form type
        const isForm47 = formType?.includes("form-47") || formType?.includes("consumer-proposal") || formNumber === "47";
        const isForm76 = formType?.includes("form-76") || formType?.includes("statement-affairs") || formNumber === "76";
        const isForm31 = formType?.includes("form-31") || formType?.includes("proof-claim") || formNumber === "31";

        // Create context for analysis process
        const context: AnalysisProcessContext = {
          setAnalysisStep,
          setProgress,
          setError,
          setProcessingStage,
          toast,
          isForm47,
          isForm76,
          isForm31
        };

        // Risk assessment stage
        const risks = await useRiskAssessment(context, documentId, documentText);

        // Set final progress and step
        setProgress(100);
        setAnalysisStep("Analysis completed");
        
        if (onAnalysisComplete) {
          onAnalysisComplete();
        }
        
        return {
          success: true,
          risks
        };
      } catch (error: any) {
        console.error("Error in document analysis:", error);
        setError(error.message || "An unknown error occurred during analysis");
        toast({
          title: "Analysis Error",
          description: error.message || "Failed to analyze document",
          variant: "destructive",
        });
        return {
          success: false,
          error: error.message || "An unknown error occurred during analysis"
        };
      }
    },
    []
  );

  return {
    analyzeDocument,
    analysisStep,
    progress,
    error,
    processingStage,
    setProcessingStage,
    setAnalysisStep,
    setProgress,
    setError
  };
};
