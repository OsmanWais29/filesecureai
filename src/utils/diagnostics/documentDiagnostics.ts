
import { supabase } from "@/lib/supabase";
import { safeStringCast, safeObjectCast } from "@/utils/typeGuards";

export interface DiagnosticResults {
  success: boolean;
  message: string;
  documentExists: boolean;
  analysisExists: boolean;
  storageValid: boolean;
  metadata: Record<string, any>;
  errors: string[];
  results?: {
    documentRecord?: any;
    storage?: any;
    analysis?: any;
    diagnosticsDuration?: string;
  };
}

/**
 * Comprehensive document diagnostics for troubleshooting
 */
export const runDocumentDiagnostics = async (documentId: string): Promise<DiagnosticResults> => {
  console.log(`Running document diagnostics for: ${documentId}`);
  
  const startTime = Date.now();
  const results: DiagnosticResults = {
    success: true,
    message: "Diagnostics completed",
    documentExists: false,
    analysisExists: false,
    storageValid: false,
    metadata: {} as Record<string, any>,
    errors: [] as string[],
    results: {}
  };

  try {
    // Check document existence
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      results.success = false;
      results.errors.push('Document not found');
      return results;
    }

    results.documentExists = true;
    results.results!.documentRecord = document;
    
    // Safe storage path handling
    const storagePath = safeStringCast(document.storage_path);
    if (storagePath) {
      try {
        const { data: storageData, error: storageError } = await supabase.storage
          .from('documents')
          .download(storagePath);
          
        if (!storageError && storageData) {
          results.storageValid = true;
          results.results!.storage = {
            accessible: true,
            publicUrl: storagePath,
            statusCode: 200,
            fetchTime: `${Date.now() - startTime}ms`
          };
        } else {
          results.results!.storage = {
            accessible: false,
            publicUrl: storagePath,
            statusCode: 404,
            fetchTime: `${Date.now() - startTime}ms`
          };
        }
      } catch (err) {
        results.errors.push('Storage access failed');
        results.results!.storage = {
          accessible: false,
          publicUrl: storagePath,
          statusCode: 500,
          fetchTime: `${Date.now() - startTime}ms`
        };
      }
    }

    // Check metadata safely
    const metadata = safeObjectCast(document.metadata);
    if (metadata.processing_steps_completed) {
      results.metadata.processingSteps = metadata.processing_steps_completed;
    }

    // Check analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .maybeSingle();

    if (!analysisError && analysis) {
      results.analysisExists = true;
      
      // Safe date handling
      if (analysis.created_at) {
        try {
          const createdDate = new Date(safeStringCast(analysis.created_at));
          results.metadata.analysisCreated = createdDate.toISOString();
          
          const minutesSinceUpdate = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60));
          results.results!.analysis = {
            status: safeStringCast(document.ai_processing_status),
            stepsCompleted: metadata.processing_steps_completed || 0,
            lastUpdateTime: createdDate.toLocaleString(),
            minutesSinceLastUpdate: minutesSinceUpdate
          };
        } catch (dateErr) {
          results.errors.push('Invalid analysis date');
        }
      }
    }

    const endTime = Date.now();
    results.results!.diagnosticsDuration = `${endTime - startTime}ms`;

    return results;

  } catch (error) {
    console.error('Diagnostics error:', error);
    return {
      success: false,
      message: `Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      documentExists: false,
      analysisExists: false,
      storageValid: false,
      metadata: {},
      errors: ['System error'],
      results: {
        diagnosticsDuration: `${Date.now() - startTime}ms`
      }
    };
  }
};

/**
 * Enhanced document analysis diagnostics
 */
export const runAnalysisDiagnostics = async (documentId: string) => {
  try {
    const { data: analysis, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error || !analysis) {
      return {
        success: false,
        message: 'No analysis found',
        hasContent: false
      };
    }

    const content = safeObjectCast(analysis.content);
    const metadata = safeObjectCast(analysis.metadata);
    
    return {
      success: true,
      message: 'Analysis found',
      hasContent: !!content,
      hasMetadata: !!metadata,
      processingSteps: metadata.processing_steps_completed || 0,
      formType: safeStringCast(content.formType || '')
    };

  } catch (error) {
    return {
      success: false,
      message: `Analysis diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      hasContent: false
    };
  }
};

export const retryDocumentAnalysis = async (documentId: string) => {
  try {
    // Reset document processing status
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ai_processing_status: 'pending',
        metadata: {
          retry_requested_at: new Date().toISOString(),
          processing_status: 'retrying'
        }
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Document analysis retry initiated successfully'
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retry analysis'
    };
  }
};

export const repairDocumentIssues = async (documentId: string) => {
  try {
    const actions: string[] = [];
    const errors: string[] = [];

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      errors.push('Document not found');
      return { success: false, actions, errors };
    }

    // Check and repair storage path
    const storagePath = safeStringCast(document.storage_path);
    if (!storagePath) {
      // Try to reconstruct storage path
      const title = safeStringCast(document.title);
      if (title) {
        const reconstructedPath = `documents/${documentId}/${title}`;
        
        const { error: updateError } = await supabase
          .from('documents')
          .update({ storage_path: reconstructedPath })
          .eq('id', documentId);

        if (updateError) {
          errors.push('Failed to repair storage path');
        } else {
          actions.push('Reconstructed missing storage path');
        }
      }
    }

    // Reset stuck processing status
    const aiStatus = safeStringCast(document.ai_processing_status);
    if (aiStatus === 'processing') {
      const { error: resetError } = await supabase
        .from('documents')
        .update({
          ai_processing_status: 'pending',
          metadata: {
            ...safeObjectCast(document.metadata),
            repair_timestamp: new Date().toISOString(),
            processing_status: 'reset'
          }
        })
        .eq('id', documentId);

      if (resetError) {
        errors.push('Failed to reset processing status');
      } else {
        actions.push('Reset stuck processing status');
      }
    }

    return {
      success: errors.length === 0,
      actions,
      errors
    };

  } catch (error) {
    return {
      success: false,
      actions: [],
      errors: [error instanceof Error ? error.message : 'Unknown repair error']
    };
  }
};
