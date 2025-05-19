
import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "../../types";
import { updateAnalysisStatus } from "../documentStatusUpdates";
import { AnalysisProcessProps } from "../types";
import { isForm76, isForm47 } from "../formIdentification";
import { toSafeSpreadArray, toSafeSpreadObject } from "@/utils/typeSafetyUtils";

export const documentClassification = async (
  documentRecord: DocumentRecord,
  context: AnalysisProcessProps
): Promise<{ documentText: string; isForm76: boolean; isForm47: boolean }> => {
  const { setAnalysisStep, setProgress } = context;
  setAnalysisStep("Stage 2: Document Classification & Understanding...");
  setProgress(25);
  
  try {
    // Get document content from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(documentRecord.storage_path || '');
      
    if (fileError) {
      throw fileError;
    }
    
    // Convert file to text (simplified for implementation)
    const documentText = await fileData.text();
    
    // Check for specialized form types using our enhanced detection
    const isForm76Document = isForm76(documentRecord, documentText);
    const isForm47Document = isForm47(documentRecord, documentText);
    
    // Check for Form 31 (Proof of Claim)
    const isForm31 = documentRecord.title?.toLowerCase().includes('form 31') || 
                     documentRecord.title?.toLowerCase().includes('proof of claim') ||
                     documentText.toLowerCase().includes('proof of claim') ||
                     documentText.toLowerCase().includes('form 31');
    
    console.log(`Document classification results - Form 76: ${isForm76Document}, Form 47: ${isForm47Document}, Form 31: ${isForm31}`);
    
    // Determine form type based on our analysis
    let formType = 'unknown';
    let formNumber = '';
    
    if (isForm76Document) {
      formType = 'form-76';
      formNumber = '76';
    } else if (isForm47Document) {
      formType = 'form-47';
      formNumber = '47';
    } else if (isForm31) {
      formType = 'form-31';
      formNumber = '31';
    }
    
    const processingStepsCompleted = documentRecord.metadata?.processing_steps_completed 
      ? toSafeSpreadArray<string>(documentRecord.metadata.processing_steps_completed) 
      : [];
    
    // Update document with classification results
    await supabase
      .from('documents')
      .update({
        metadata: {
          ...toSafeSpreadObject(documentRecord.metadata),
          formType,
          formNumber,
          classification_confidence: (isForm76Document || isForm47Document || isForm31) ? 'high' : 'medium',
          processing_stage: 'classification',
          processing_steps_completed: [...processingStepsCompleted, 'ingestion_completed']
        }
      })
      .eq('id', documentRecord.id);
      
    // Update document status
    await updateAnalysisStatus(documentRecord, 'classification', 'ingestion_completed');
    
    return { documentText, isForm76: isForm76Document, isForm47: isForm47Document };
  } catch (error) {
    console.error('Error in document classification:', error);
    throw error;
  }
};
