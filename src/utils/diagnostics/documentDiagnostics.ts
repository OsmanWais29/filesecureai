
import { supabase } from "@/lib/supabase";
import { safeStringCast, safeObjectCast } from "@/utils/typeGuards";

/**
 * Comprehensive document diagnostics for troubleshooting
 */
export const runDocumentDiagnostics = async (documentId: string) => {
  console.log(`Running document diagnostics for: ${documentId}`);
  
  const results = {
    success: true,
    message: "Diagnostics completed",
    documentExists: false,
    analysisExists: false,
    storageValid: false,
    metadata: {} as Record<string, any>,
    errors: [] as string[]
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
    
    // Safe storage path handling
    const storagePath = safeStringCast(document.storage_path);
    if (storagePath) {
      try {
        const { data: storageData, error: storageError } = await supabase.storage
          .from('documents')
          .download(storagePath);
          
        if (!storageError && storageData) {
          results.storageValid = true;
        }
      } catch (err) {
        results.errors.push('Storage access failed');
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
        } catch (dateErr) {
          results.errors.push('Invalid analysis date');
        }
      }
    }

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
      errors: ['System error']
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
