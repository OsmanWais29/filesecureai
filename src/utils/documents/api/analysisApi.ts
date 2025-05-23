
import { supabase } from '@/lib/supabase';
import { safeStringCast, safeObjectCast } from '@/utils/typeGuards';

interface AnalysisRequest {
  documentId: string;
  storagePath: string;
  title: string;
  includeRegulatory?: boolean;
  includeClientExtraction?: boolean;
  debug?: boolean;
}

interface AnalysisResponse {
  success: boolean;
  analysis?: any;
  error?: string;
  processingStatus?: string;
}

export const requestDocumentAnalysis = async (
  request: AnalysisRequest
): Promise<AnalysisResponse> => {
  try {
    console.log('Requesting document analysis:', request);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if document exists
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', request.documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Safe metadata handling
    const metadata = safeObjectCast(document.metadata);
    const title = safeStringCast(document.title || request.title);
    
    // Check if document type is determinable
    const titleLower = title.toLowerCase();
    if (titleLower.includes('form')) {
      const documentType = metadata.documentType || 'form';
      const formType = metadata.formType || 'unknown';
      
      console.log(`Processing ${documentType} - ${formType}`);
    }

    // Mark document as processing
    await supabase
      .from('documents')
      .update({
        ai_processing_status: 'processing',
        metadata: {
          ...metadata,
          analysis_requested_at: new Date().toISOString(),
          processing_status: 'analyzing'
        }
      })
      .eq('id', request.documentId);

    // Call the edge function
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('process-ai-request', {
      body: {
        documentId: request.documentId,
        storagePath: request.storagePath,
        title: request.title,
        includeRegulatory: request.includeRegulatory || true,
        includeClientExtraction: request.includeClientExtraction || true,
        debug: request.debug || false
      }
    });

    if (analysisError) {
      throw new Error(`Analysis API error: ${analysisError.message}`);
    }

    // Update processing status
    const finalMetadata = safeObjectCast(document.metadata);
    const processingSteps = finalMetadata.processing_steps_completed || 0;
    const hasProcessingSteps = typeof processingSteps === 'number' && processingSteps > 0;

    let processingStatus = 'completed';
    let aiProcessingStatus = 'complete';
    let processingError = '';

    if (!analysisData) {
      processingStatus = 'failed';
      aiProcessingStatus = 'failed';
      processingError = safeStringCast(finalMetadata.processing_error || 'Analysis returned no data');
    }

    await supabase
      .from('documents')
      .update({
        ai_processing_status: aiProcessingStatus,
        metadata: {
          ...finalMetadata,
          analysis_completed_at: new Date().toISOString(),
          processing_status: processingStatus,
          has_analysis: !!analysisData,
          processing_steps_completed: hasProcessingSteps ? processingSteps : 1
        }
      })
      .eq('id', request.documentId);

    return {
      success: !!analysisData,
      analysis: analysisData,
      processingStatus
    };

  } catch (error) {
    console.error('Error in requestDocumentAnalysis:', error);
    
    // Update document status to failed
    try {
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'failed',
          metadata: {
            analysis_error: error instanceof Error ? error.message : 'Unknown error',
            analysis_failed_at: new Date().toISOString()
          }
        })
        .eq('id', request.documentId);
    } catch (updateError) {
      console.error('Failed to update document status:', updateError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
