
import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "../../types";
import { AnalysisProcessContext } from "../types";
import { toSafeSpreadArray, toSafeSpreadObject } from "@/utils/typeSafetyUtils";

export const continuousLearning = async (
  documentRecord: DocumentRecord,
  context: AnalysisProcessContext
): Promise<void> => {
  const { setAnalysisStep, setProgress, toast, onAnalysisComplete, isForm76 } = context;
  
  const processingStepsCompleted = documentRecord.metadata?.processing_steps_completed 
    ? toSafeSpreadArray<string>(documentRecord.metadata.processing_steps_completed) 
    : [];
  
  // Final update - processing complete
  await supabase
    .from('documents')
    .update({
      ai_processing_status: 'completed',
      metadata: {
        ...toSafeSpreadObject(documentRecord.metadata),
        processing_stage: 'completed',
        processing_steps_completed: [...processingStepsCompleted, 'analysis_completed'],
        completion_date: new Date().toISOString()
      }
    })
    .eq('id', documentRecord.id);

  setAnalysisStep("Stage 8: Continuous AI Learning & Improvement...");
  setProgress(100);
  
  toast({
    title: "Analysis Complete",
    description: isForm76 ? 
      "Form 76 has been fully analyzed with client details extraction" : 
      "Document has been analyzed with content extraction"
  });

  if (onAnalysisComplete) {
    onAnalysisComplete();
  }
};
