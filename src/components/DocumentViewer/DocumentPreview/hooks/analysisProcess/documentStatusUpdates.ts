
import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "../types";
import { toSafeSpreadArray, toSafeSpreadObject } from "@/utils/typeSafetyUtils";

/**
 * Updates the document's analysis status with the current processing stage
 */
export const updateAnalysisStatus = async (
  documentRecord: DocumentRecord,
  processingStage: string,
  stepCompleted: string
) => {
  const processingStepsCompleted = documentRecord.metadata?.processing_steps_completed 
    ? toSafeSpreadArray<string>(documentRecord.metadata.processing_steps_completed) 
    : [];

  const updatedMetadata = {
    ...toSafeSpreadObject(documentRecord.metadata),
    processing_stage: processingStage,
    processing_steps_completed: [...processingStepsCompleted, stepCompleted]
  };

  return await supabase
    .from('documents')
    .update({
      ai_processing_status: 'processing',
      metadata: updatedMetadata
    })
    .eq('id', documentRecord.id);
};
