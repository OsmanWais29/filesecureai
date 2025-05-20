
import { DocumentRecord } from '../../types';
import { supabase } from '@/lib/supabase';
import { toString } from '@/utils/typeSafetyUtils';

export const updateAnalysisStatus = async (
  document: DocumentRecord,
  stage: string,
  status: 'started' | 'in_progress' | 'completed' | 'error'
): Promise<void> => {
  try {
    const documentId = toString(document.id);
    
    // Update the document status in the database
    const { error } = await supabase
      .from('documents')
      .update({
        ai_processing_status: status,
        ai_processing_stage: stage,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
    
    if (error) {
      console.error('Error updating document analysis status:', error);
    }
  } catch (error) {
    console.error('Failed to update analysis status:', error);
  }
};
