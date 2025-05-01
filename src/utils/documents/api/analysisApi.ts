import { supabase } from "@/lib/supabase";
import logger from "@/utils/logger";
import { AnalysisResult } from "../types/analysisTypes";

export const triggerDocumentAnalysis = async (
  documentId: string, 
  fileName: string = "", 
  isSpecialForm: boolean = false,
  isExcelFile: boolean = false
) => {
  try {
    logger.debug(`[AI Integration] Starting document analysis for ID: ${documentId}`);
    
    // First, check if we need to fetch document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('title, metadata, type, storage_path')
      .eq('id', documentId)
      .single();
      
    if (docError) {
      logger.error('[AI Integration] Error fetching document:', docError);
      throw docError;
    }
    
    if (!document || !document.storage_path) {
      throw new Error('[AI Integration] Document not found or missing storage path');
    }
    
    // Update document status to processing
    await updateDocumentStatus(documentId, 'processing');
    
    // Determine form type from metadata or title
    let formType = 'unknown';
    const title = (document?.title || fileName || '').toLowerCase();
    
    if (document?.metadata?.documentType) {
      formType = document.metadata.documentType;
    } else if (document?.metadata?.formType) {
      formType = document.metadata.formType;
    } else if (title.includes('form 31') || title.includes('form31') || title.includes('proof of claim')) {
      formType = 'form-31';
    } else if (title.includes('form 47') || title.includes('form47') || title.includes('consumer proposal')) {
      formType = 'form-47';
    } else if (title.includes('form 76') || title.includes('form76') || title.includes('statement of affairs') || isSpecialForm) {
      formType = 'form-76';
    }
    
    logger.info(`[AI Integration] Detected form type: ${formType} for document: ${documentId}`);
    
    // Get current auth session to ensure valid JWT token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.error("[AI Integration] Authentication error when retrieving session:", sessionError);
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    if (!sessionData.session) {
      throw new Error("[AI Integration] No active session found. User must be authenticated.");
    }
    
    logger.info("[AI Integration] Authentication valid, proceeding with AI analysis request");

    // Prepare request parameters with detailed extraction patterns
    const requestParams = { 
      documentId, 
      includeRegulatory: true,
      includeClientExtraction: true,
      extractionMode: 'comprehensive',
      title: document?.title || fileName || '',
      formType,
      isExcelFile,
      storagePath: document.storage_path,
      extractionPatterns: {
        // Enhanced patterns for better form field extraction
        form31: {
          creditorName: "(?:creditor|claimant)(?:'s)?\\s+name\\s*:\\s*([\\w\\s\\.\\-']+)",
          debtorName: "(?:debtor|bankrupt)(?:'s)?\\s+name\\s*:\\s*([\\w\\s\\.\\-']+)",
          claimAmount: "(?:claim\\s+amount|amount\\s+of\\s+claim)\\s*[:$]\\s*([\\d,.]+)",
          securityValue: "(?:security|collateral)\\s+value\\s*[:$]\\s*([\\d,.]+)"
        },
        form47: {
          clientName: "(?:consumer\\s+debtor|debtor)(?:'s)?\\s+name\\s*:\\s*([\\w\\s\\.\\-']+)",
          filingDate: "(?:filing|submission)\\s+date\\s*:\\s*(\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4}|\\w+\\s+\\d{1,2},?\\s+\\d{4})",
          proposalPayment: "(?:monthly\\s+payment|payment\\s+amount)\\s*[:$]\\s*([\\d,.]+)"
        },
        form76: {
          clientName: "(?:debtor|bankrupt)(?:'s)?\\s+name\\s*:\\s*([\\w\\s\\.\\-']+)",
          totalAssets: "(?:total\\s+assets|assets\\s+total)\\s*[:$]\\s*([\\d,.]+)",
          totalLiabilities: "(?:total\\s+liabilities|liabilities\\s+total)\\s*[:$]\\s*([\\d,.]+)"
        }
      },
      debug: true // Enable debug info from the AI service
    };

    logger.debug("[AI Integration] Calling process-ai-request with parameters:", 
      JSON.stringify({
        documentId: requestParams.documentId,
        formType: requestParams.formType,
        storagePath: requestParams.storagePath
      })
    );

    // Call the Supabase Edge Function for AI analysis
    const { data, error } = await supabase.functions.invoke('process-ai-request', {
      body: requestParams
    });

    if (error) {
      logger.error('[AI Integration] Error from process-ai-request edge function:', error);
      await updateDocumentStatus(documentId, 'failed');
      throw error;
    }

    if (data) {
      logger.info('[AI Integration] Analysis request successful, processing results');
      await updateDocumentStatus(documentId, 'complete');
      
      // Log some of the data we received to help with debugging
      if (data.extracted_info) {
        logger.debug('[AI Integration] Extracted fields:', 
          Object.keys(data.extracted_info).join(', ')
        );
      }
      
      if (data.risks && Array.isArray(data.risks)) {
        logger.debug(`[AI Integration] Identified ${data.risks.length} risks`);
      }
    } else {
      logger.warn('[AI Integration] No data returned from AI service');
    }
    
    return data;
  } catch (error) {
    logger.error('[AI Integration] Failed to trigger document analysis:', error);
    throw error;
  }
};

export const saveAnalysisResults = async (
  documentId: string, 
  userId: string, 
  analysisData: AnalysisResult
) => {
  try {
    logger.debug(`Saving analysis results for document ID: ${documentId}`);
    
    // Validate analysis data before saving
    if (!analysisData) {
      throw new Error("No analysis data provided");
    }
    
    // Check for documentation markers in analysis 
    // (to detect when the system is analyzing documentation about forms, not actual forms)
    const containsDocumentationMarkers = (content: string) => {
      const markers = [
        'you are analyzing', 
        'extract the following', 
        'return json', 
        'json format',
        'template',
        'documentation'
      ];
      
      if (typeof content !== 'string') return false;
      const lowerContent = content.toLowerCase();
      return markers.some(marker => lowerContent.includes(marker));
    };
    
    // Check if summary appears to be documentation instructions
    if (analysisData.extracted_info && 
        analysisData.extracted_info.summary && 
        containsDocumentationMarkers(analysisData.extracted_info.summary)) {
      
      logger.warn('Detected documentation instructions in analysis summary - fixing');
      // Replace with generic summary to avoid confusion
      analysisData.extracted_info.summary = 'Document analyzed. See extracted information.';
    }
    
    // Check if document analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .single();
      
    if (existingAnalysis) {
      // Update existing analysis
      const { error } = await supabase
        .from('document_analysis')
        .update({
          content: analysisData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAnalysis.id);
        
      if (error) {
        logger.error('Error updating analysis results:', error);
        throw error;
      }
    } else {
      // Create new analysis record
      const { error } = await supabase
        .from('document_analysis')
        .insert([{
          document_id: documentId,
          user_id: userId,
          content: analysisData
        }]);

      if (error) {
        logger.error('Error saving analysis results:', error);
        throw error;
      }
    }
    
    // Also update document metadata with extracted information
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        metadata: {
          ...analysisData.extracted_info,
          analyzed_at: new Date().toISOString(),
          has_analysis: true
        },
        ai_processing_status: 'complete'
      })
      .eq('id', documentId);
      
    if (updateError) {
      logger.warn('Error updating document with analysis metadata:', updateError);
    }
    
    logger.info('Analysis results saved successfully for document ID:', documentId);
  } catch (error) {
    logger.error('Error in saveAnalysisResults:', error);
    throw error;
  }
};

export const updateDocumentStatus = async (
  documentId: string, 
  status: 'processing' | 'processing_financial' | 'complete' | 'failed'
) => {
  try {
    logger.debug(`Updating document status to ${status} for ID: ${documentId}`);
    
    const { error } = await supabase
      .from('documents')
      .update({ ai_processing_status: status })
      .eq('id', documentId);
      
    if (error) {
      logger.error(`Error updating document status to ${status}:`, error);
      throw error;
    }
    
    logger.info(`Document status updated to ${status} for document ID:`, documentId);
  } catch (error) {
    logger.error('Error in updateDocumentStatus:', error);
    throw error;
  }
};

export const createClientIfNotExists = async (clientInfo: any) => {
  if (!clientInfo?.clientName) {
    logger.debug('No client name provided, skipping client creation');
    return null;
  }
  
  try {
    const clientName = clientInfo.clientName.trim();
    logger.debug(`Checking if client exists: "${clientName}"`);
    
    // Check if client already exists
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .ilike('name', clientName)
      .limit(1);
      
    if (checkError) {
      logger.error('Error checking for existing client:', checkError);
      throw checkError;
    }
    
    // If client exists, return their ID
    if (existingClients && existingClients.length > 0) {
      logger.debug(`Client "${clientName}" already exists with ID: ${existingClients[0].id}`);
      return existingClients[0].id;
    }
    
    logger.debug(`Creating new client: "${clientName}"`);
    
    // Create new client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        name: clientName,
        email: clientInfo.clientEmail || null,
        phone: clientInfo.clientPhone || null,
        metadata: {
          address: clientInfo.clientAddress || null,
          totalDebts: clientInfo.totalDebts || null,
          totalAssets: clientInfo.totalAssets || null,
          monthlyIncome: clientInfo.monthlyIncome || null
        }
      })
      .select('id')
      .single();
      
    if (error) {
      logger.error('Error creating client:', error);
      throw error;
    }
    
    logger.info(`Created new client with ID: ${newClient.id}`);
    return newClient.id;
  } catch (error) {
    logger.error('Error in createClientIfNotExists:', error);
    return null;
  }
};

export const monitorAnalysisProgress = async (documentId: string): Promise<{
  status: string;
  progress: number;
  lastUpdate: string | null;
  error: string | null;
}> => {
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select('ai_processing_status, metadata, updated_at')
      .eq('id', documentId)
      .single();
      
    if (error) {
      logger.error('[AI Integration] Error checking analysis status:', error);
      return {
        status: 'error',
        progress: 0,
        lastUpdate: null,
        error: error.message
      };
    }
    
    // Calculate progress based on status
    let progress = 0;
    switch (document?.ai_processing_status) {
      case 'processing':
        progress = 50;
        break;
      case 'processing_financial':
        progress = 75;
        break;
      case 'complete':
        progress = 100;
        break;
      case 'failed':
        progress = 0;
        break;
      default:
        progress = 25; // Default for 'pending' or unknown
    }
    
    // Use more precise progress if available in metadata
    if (document?.metadata?.processing_steps_completed?.length) {
      const completedSteps = document.metadata.processing_steps_completed.length;
      const totalSteps = 8; // Total number of processing steps
      progress = Math.min(Math.round((completedSteps / totalSteps) * 100), 100);
    }
    
    return {
      status: document?.ai_processing_status || 'unknown',
      progress,
      lastUpdate: document?.updated_at || null,
      error: document?.metadata?.processing_error || null
    };
  } catch (error: any) {
    logger.error('[AI Integration] Error monitoring analysis progress:', error);
    return {
      status: 'error',
      progress: 0,
      lastUpdate: null,
      error: error.message
    };
  }
};
