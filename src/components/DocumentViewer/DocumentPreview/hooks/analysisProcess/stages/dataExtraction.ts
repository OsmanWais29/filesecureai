
import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "../../types";
import { updateAnalysisStatus } from "../documentStatusUpdates";
import { AnalysisProcessContext } from "../types";
import { toSafeSpreadArray, toSafeSpreadObject } from "@/utils/typeSafetyUtils";

export const dataExtraction = async (
  documentRecord: DocumentRecord,
  isForm76: boolean,
  context: AnalysisProcessContext
): Promise<void> => {
  const { setAnalysisStep, setProgress } = context;
  
  setAnalysisStep("Stage 3: Data Extraction & Content Processing...");
  setProgress(40);
  
  const processingStepsCompleted = documentRecord.metadata?.processing_steps_completed 
    ? toSafeSpreadArray<string>(documentRecord.metadata.processing_steps_completed) 
    : [];
  
  // Update document with classification results
  await supabase
    .from('documents')
    .update({
      metadata: {
        ...toSafeSpreadObject(documentRecord.metadata),
        formType: isForm76 ? 'form-76' : 'unknown',
        processing_stage: 'data_extraction',
        processing_steps_completed: [...processingStepsCompleted, 'classification_completed']
      }
    })
    .eq('id', documentRecord.id);
    
  // Update document status
  await updateAnalysisStatus(documentRecord, 'data_extraction', 'classification_completed');
  
  // Create notification about data extraction phase
  try {
    const userData = await supabase.auth.getUser();
    if (userData.data.user) {
      await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: userData.data.user.id,
          notification: {
            title: 'Document Data Extraction',
            message: `Data extraction for "${documentRecord.title}" is now complete`,
            type: 'info',
            category: 'file_activity',
            priority: 'normal',
            action_url: `/documents/${documentRecord.id}`,
            metadata: {
              documentId: documentRecord.id,
              phase: 'data_extraction',
              completed: new Date().toISOString()
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("Error creating notification for data extraction:", error);
    // Continue with the process even if notification creation fails
  }
};
