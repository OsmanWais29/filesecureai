
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { riskAssessment } from "./stages/riskAssessment";

export interface AnalysisProcessProps {
  setAnalysisStep: (step: string) => void;
  setProgress: (progress: number) => void;
  setError: (error: string) => void;
  setProcessingStage: (stage: string) => void;
  toast: any;
  onAnalysisComplete?: () => void;
}

export const useAnalysisProcess = (props: AnalysisProcessProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const startAnalysis = useCallback(async () => {
    const { 
      setAnalysisStep,
      setProgress,
      setError,
      setProcessingStage,
      toast,
      onAnalysisComplete 
    } = props;

    setIsAnalyzing(true);
    setAnalysisStep("initializing");
    
    try {
      // Initialize processing steps
      const steps = ['extract_text', 'analyze_content', 'extract_metadata', 'assess_risks', 'generate_summary'];
      setProcessingSteps(steps);
      
      // Set initial progress
      setProgress(10);
      setProcessingStage('processing');

      // Process each step with simulated timing
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setAnalysisStep(step);
        
        // Update progress based on current step
        const progressIncrement = 80 / steps.length;
        const currentProgress = 10 + (i + 1) * progressIncrement;
        setProgress(currentProgress);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Set completed
      setProgress(100);
      setProcessingStage('completed');
      
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
      
      toast({
        title: "Analysis Complete",
        description: "Document analysis completed successfully"
      });
      
    } catch (error: any) {
      console.error("Analysis process failed:", error);
      setError(error.message || "Failed to analyze document");
      setProcessingStage('failed');
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze document."
      });
      
    } finally {
      setIsAnalyzing(false);
    }
  }, [props]);

  return {
    startAnalysis,
    isAnalyzing,
    analysisStep,
    processingSteps
  };
};
