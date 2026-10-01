
import { supabase } from "@/lib/supabase";
import { updateAnalysisStatus } from "../documentStatusUpdates";
import { AnalysisProcessProps } from "../types";
import { DocumentRecord } from "../../types";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
export const collaborationSetup = async (
  documentRecord: DocumentRecord,
  documentText: string,
  isForm76: boolean,
  context: AnalysisProcessProps & { isForm76?: boolean }
) => {
  const { setProcessingStage, setProgress } = context;
  
  setProcessingStage("Setting up collaboration workspace");
  setProgress(90);
  
  try {
    // Get document analysis to extract potential assignees
    const { data: analysis } = await supabase
      .from('document_analysis')
      .select('content')
      .eq('document_id', documentRecord.id)
      .single();
    
    // Update document status
    await updateAnalysisStatus(
      documentRecord,
      "Collaboration Setup",
      "Collaboration environment prepared"
    );
    
    // Create notification about document analysis completion
    const userData = await supabase.auth.getUser();
    if (userData.data.user) {
      await sfaiFunctions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: userData.data.user.id,
          notification: {
            title: 'Document Analysis Complete',
            message: `Analysis of "${documentRecord.title}" is now complete`,
            type: 'info',
            category: 'file_activity',
            priority: 'normal',
            action_url: `/documents/${documentRecord.id}`,
            metadata: {
              documentId: documentRecord.id,
              analysisType: isForm76 ? 'form-76' : 'standard',
              completed: new Date().toISOString(),
              category: 'file_activity'
            }
          }
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error in collaboration setup:", error);
    throw error;
  }
};
