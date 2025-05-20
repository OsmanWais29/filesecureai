
export interface AnalysisProcessContext {
  setAnalysisStep: (step: string) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setProcessingStage: (stage: string) => void;
  toast: any;
  isForm47: boolean;
  isForm76: boolean;
  isForm31: boolean; // Added this field that was missing
}
