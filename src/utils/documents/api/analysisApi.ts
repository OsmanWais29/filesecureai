
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

export const monitorAnalysisProgress = async (documentId: string) => {
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return {
        status: 'failed',
        progress: 0,
        error: 'Document not found',
        lastUpdate: null
      };
    }

    const metadata = safeObjectCast(document.metadata);
    const aiStatus = safeStringCast(document.ai_processing_status);
    const processingSteps = metadata.processing_steps_completed || 0;
    
    let progress = 0;
    let status = aiStatus || 'pending';
    
    if (status === 'complete') {
      progress = 100;
    } else if (status === 'processing') {
      progress = Math.min(processingSteps * 25, 75);
    }

    return {
      status,
      progress,
      error: metadata.analysis_error ? safeStringCast(metadata.analysis_error) : null,
      lastUpdate: document.updated_at
    };

  } catch (error) {
    return {
      status: 'failed',
      progress: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastUpdate: null
    };
  }
};

export const triggerDocumentAnalysis = async (documentId: string, storagePath: string, title: string) => {
  return requestDocumentAnalysis({
    documentId,
    storagePath,
    title,
    includeRegulatory: true,
    includeClientExtraction: true
  });
};

export const saveAnalysisResults = async (documentId: string, analysisData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('document_analysis')
      .upsert({
        document_id: documentId,
        user_id: user.id,
        content: analysisData,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const updateDocumentStatus = async (documentId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ 
        ai_processing_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const createClientIfNotExists = async (clientName: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if client exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('name', clientName)
      .single();

    if (existingClient) {
      return { success: true, clientId: existingClient.id };
    }

    // Create new client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        name: clientName,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, clientId: newClient.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
