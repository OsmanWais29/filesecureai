
import { supabase } from "@/lib/supabase";
import logger from "@/utils/logger";
import { AnalysisResult } from "../types/analysisTypes";

export const triggerDocumentAnalysis = async (documentId: string, fileName: string = "", isSpecialForm: boolean = false) => {
  try {
    logger.debug(`Triggering document analysis for ID: ${documentId}`);
    
    // First, check if we need to fetch document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('title, metadata, type, storage_path')
      .eq('id', documentId)
      .single();
      
    if (docError) {
      console.error('Error fetching document:', docError);
      throw docError;
    }
    
    if (!document || !document.storage_path) {
      throw new Error('Document not found or missing storage path');
    }
    
    // Update document status to processing
    await updateDocumentStatus(documentId, 'processing');
    
    // Determine form type from metadata or title
    let formType = 'unknown';
    const title = (document?.title || fileName || '').toLowerCase();
    
    if (document?.metadata?.documentType) {
      formType = document.metadata.documentType;
    } else if (title.includes('form 31') || title.includes('form31') || title.includes('proof of claim')) {
      formType = 'form-31';
    } else if (title.includes('form 47') || title.includes('form47') || title.includes('consumer proposal')) {
      formType = 'form-47';
    } else if (title.includes('form 76') || title.includes('form76') || title.includes('statement of affairs') || isSpecialForm) {
      formType = 'form-76';
    }
    
    // Check if this is an Excel file
    const isExcelFile = document?.type?.includes('excel') || 
                       document?.type?.includes('spreadsheet') ||
                       title.includes('.xls');

    // Get current auth session to ensure valid JWT token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Authentication error when retrieving session:", sessionError);
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    if (!sessionData.session) {
      throw new Error("No active session found. User must be authenticated.");
    }

    // Call the process-ai-request edge function for AI analysis
    console.log("Invoking process-ai-request edge function with authenticated session");
    const { data, error } = await supabase.functions.invoke('process-ai-request', {
      body: { 
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
        }
      }
    });

    if (error) {
      console.error('Error from process-ai-request edge function:', error);
      await updateDocumentStatus(documentId, 'failed');
      throw error;
    }

    if (data) {
      console.log('Analysis request successful:', data);
      await updateDocumentStatus(documentId, 'complete');
    }
    
    logger.debug(`Successfully triggered document analysis for ID: ${documentId}`);
    return data;
  } catch (error) {
    console.error('Failed to trigger document analysis:', error);
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
