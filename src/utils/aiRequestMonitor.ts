
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Interface for AI request logs
interface AIRequestLog {
  documentId: string;
  requestTime: string;
  requestType: string;
  status: 'initiated' | 'processing' | 'completed' | 'failed';
  details?: any;
}

// Function to log AI requests for debugging
export const logAIRequest = async (log: Partial<AIRequestLog>): Promise<void> => {
  try {
    // Add timestamp if not provided
    const requestTime = log.requestTime || new Date().toISOString();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Log request to ai_request_logs table (will create table if needed)
    const { error } = await supabase
      .from('ai_request_logs')
      .insert([{
        document_id: log.documentId,
        request_time: requestTime,
        request_type: log.requestType || 'document_analysis',
        status: log.status || 'initiated',
        user_id: user?.id,
        details: log.details || {}
      }])
      .select();
      
    if (error) {
      console.error('AI request log error:', error);
    }
  } catch (err) {
    console.error('Failed to log AI request:', err);
    // Non-critical error, just log and continue
  }
};

// Function to check if a document has pending analysis
export const checkPendingAnalysis = async (documentId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('ai_processing_status')
      .eq('id', documentId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data?.ai_processing_status === 'processing';
  } catch (err) {
    console.error('Error checking pending analysis:', err);
    return false;
  }
};

// Function to manually trigger analysis for a document
export const triggerManualAnalysis = async (documentId: string): Promise<void> => {
  try {
    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path, title')
      .eq('id', documentId)
      .single();
      
    if (docError || !document) {
      throw new Error('Document not found');
    }
    
    // Mark document as pending analysis
    await supabase
      .from('documents')
      .update({
        ai_processing_status: 'pending',
        metadata: {
          ...(document.metadata || {}),
          analysis_requested_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);
      
    // Notify user
    toast.info('Document analysis request submitted');
    
    // Log the manual trigger
    await logAIRequest({
      documentId,
      requestType: 'manual_analysis',
      status: 'initiated',
      details: {
        trigger: 'manual',
        storage_path: document.storage_path
      }
    });
  } catch (err: any) {
    console.error('Error triggering manual analysis:', err);
    toast.error(`Failed to trigger analysis: ${err.message}`);
  }
};
