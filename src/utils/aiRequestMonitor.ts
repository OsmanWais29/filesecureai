
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
    console.log(`Manually triggering analysis for document: ${documentId}`);
    
    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path, title, metadata')
      .eq('id', documentId)
      .single();
      
    if (docError || !document) {
      console.error('Document not found:', docError);
      throw new Error('Document not found');
    }
    
    console.log(`Found document with storage path: ${document.storage_path}`);
    
    // Mark document as pending analysis
    await supabase
      .from('documents')
      .update({
        ai_processing_status: 'pending',
        metadata: {
          ...(document.metadata || {}),
          analysis_requested_at: new Date().toISOString(),
          analysis_status: 'pending'
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
    
    // Directly invoke the edge function for immediate processing
    console.log('Directly calling process-ai-request function');
    
    // Get a fresh session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session for API request');
      throw new Error('Authentication required for API request');
    }
    
    // Call the edge function with the document information
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('process-ai-request', {
      body: { 
        documentId,
        storagePath: document.storage_path,
        title: document.title,
        includeRegulatory: true,
        includeClientExtraction: true,
        debug: true
      }
    });
    
    if (analysisError) {
      console.error('Error invoking analysis function:', analysisError);
      throw new Error(`Analysis API error: ${analysisError.message}`);
    }
    
    console.log('Analysis API request completed successfully');
    
    // Update document status based on API response
    await supabase
      .from('documents')
      .update({
        ai_processing_status: analysisData ? 'complete' : 'failed',
        metadata: {
          ...(document.metadata || {}),
          analysis_completed_at: new Date().toISOString(),
          analysis_status: analysisData ? 'complete' : 'failed',
          has_analysis: !!analysisData
        }
      })
      .eq('id', documentId);
      
    if (analysisData) {
      toast.success('Document analysis completed successfully');
    } else {
      toast.error('Document analysis completed but no results were returned');
    }
  } catch (err: any) {
    console.error('Error triggering manual analysis:', err);
    toast.error(`Failed to trigger analysis: ${err.message}`);
    
    try {
      // Update document status to failed
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'failed',
          metadata: {
            analysis_error: err.message,
            analysis_failed_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);
    } catch (updateErr) {
      console.error('Failed to update document status:', updateErr);
    }
  }
};
