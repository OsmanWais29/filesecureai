
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DeepSeekDocumentAnalysisResult {
  formType: string;
  formNumber: string;
  clientName: string;
  confidenceScore: number;
  extractedData: Record<string, any>;
  riskFlags: string[];
  suggestedCategory: string;
  ocrText: string;
  formValidation: {
    isComplete: boolean;
    missingFields: string[];
    complianceIssues: string[];
  };
}

export class DeepSeekDocumentAnalysisService {
  
  // Enhanced document analysis using DeepSeek API
  static async analyzeDocument(
    documentId: string, 
    documentContent?: string,
    documentTitle?: string
  ): Promise<DeepSeekDocumentAnalysisResult | null> {
    try {
      console.log('Starting DeepSeek document analysis for:', documentId);
      
      // Get document details if not provided
      let docContent = documentContent;
      let docTitle = documentTitle;
      
      if (!docContent || !docTitle) {
        const { data: document, error } = await supabase
          .from('documents')
          .select('title, storage_path, metadata')
          .eq('id', documentId)
          .single();

        if (error || !document) {
          throw new Error('Failed to fetch document details');
        }

        docTitle = document.title;
        
        // For real implementation, would extract content from storage
        // For now, we'll call the enhanced edge function
        docContent = `Document: ${docTitle} - Enhanced DeepSeek analysis needed`;
      }

      // Call enhanced DeepSeek analysis edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('enhanced-osb-analysis', {
        body: {
          documentId,
          documentText: docContent,
          documentTitle: docTitle,
          analysisType: 'comprehensive_phase2',
          includeRegulatory: true,
          enhancedExtraction: true,
          reinforcementLearning: true,
          formRecognition: true,
          ocrProcessing: true,
          batchProcessing: false
        }
      });

      if (analysisError || !analysisResult?.success) {
        throw new Error(`DeepSeek analysis failed: ${analysisError?.message || 'Unknown error'}`);
      }

      const analysis = analysisResult.analysis;
      
      // Transform DeepSeek response to our format
      const result: DeepSeekDocumentAnalysisResult = {
        formType: analysis.document_details?.form_title || 'Unknown Form',
        formNumber: analysis.document_details?.form_number || 'unknown',
        clientName: analysis.client_details?.debtor_name || this.extractClientFromTitle(docTitle),
        confidenceScore: analysis.document_details?.confidence_score / 100 || 0.5,
        extractedData: analysis.client_details || {},
        riskFlags: this.extractRiskFlags(analysis.comprehensive_risk_assessment),
        suggestedCategory: this.determineCategoryFromAnalysis(analysis),
        ocrText: analysis.extracted_text || docContent,
        formValidation: {
          isComplete: analysis.comprehensive_risk_assessment?.validation_flags?.required_fields_complete || false,
          missingFields: analysis.comprehensive_risk_assessment?.compliance_status?.missing_requirements || [],
          complianceIssues: this.extractComplianceIssues(analysis)
        }
      };
      
      // Store enhanced analysis results
      await this.storeEnhancedAnalysisResults(documentId, result, analysis);
      
      return result;
    } catch (error) {
      console.error('DeepSeek document analysis failed:', error);
      toast.error('Document analysis failed');
      return null;
    }
  }

  // Batch processing for multiple documents
  static async batchAnalyzeDocuments(documentIds: string[]): Promise<Record<string, DeepSeekDocumentAnalysisResult | null>> {
    const results: Record<string, DeepSeekDocumentAnalysisResult | null> = {};
    
    toast.info(`Starting batch analysis of ${documentIds.length} documents...`);
    
    // Process in chunks of 5 to avoid overwhelming the API
    const chunks = this.chunkArray(documentIds, 5);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (documentId) => {
        const result = await this.analyzeDocument(documentId);
        return { documentId, result };
      });
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      chunkResults.forEach((promiseResult, index) => {
        const documentId = chunk[index];
        if (promiseResult.status === 'fulfilled') {
          results[documentId] = promiseResult.value.result;
        } else {
          results[documentId] = null;
          console.error(`Failed to analyze document ${documentId}:`, promiseResult.reason);
        }
      });
    }
    
    toast.success(`Batch analysis completed for ${Object.keys(results).length} documents`);
    return results;
  }

  // Enhanced form recognition patterns
  static getFormRecognitionPatterns(): Record<string, string[]> {
    return {
      '31': ['form 31', 'proof of claim', 'creditor claim', 'claim form'],
      '47': ['form 47', 'consumer proposal', 'proposal', 'debt consolidation'],
      '65': ['form 65', 'assignment in bankruptcy', 'voluntary assignment'],
      '76': ['form 76', 'statement of affairs', 'bankruptcy statement', 'asset liability'],
      '78': ['form 78', 'certificate of appointment', 'trustee appointment'],
      '85': ['form 85', 'dividend sheet', 'distribution statement'],
      '30': ['form 30', 'notice of bankruptcy', 'bankruptcy notice'],
      '32': ['form 32', 'proof of security', 'secured creditor'],
      '69': ['form 69', 'notice to creditors', 'creditor notice'],
      '79': ['form 79', 'statement of receipts', 'trustee statement']
    };
  }

  // Extract risk flags from DeepSeek analysis
  private static extractRiskFlags(riskAssessment: any): string[] {
    const flags: string[] = [];
    
    if (riskAssessment?.identified_risks) {
      riskAssessment.identified_risks.forEach((risk: any) => {
        flags.push(risk.type || risk.description || 'unknown_risk');
      });
    }
    
    const validationFlags = riskAssessment?.validation_flags;
    if (validationFlags) {
      if (!validationFlags.signature_verified) flags.push('missing_signature');
      if (!validationFlags.dates_consistent) flags.push('date_inconsistency');
      if (!validationFlags.amounts_reasonable) flags.push('amount_discrepancy');
      if (!validationFlags.required_fields_complete) flags.push('incomplete_fields');
    }
    
    return flags;
  }

  // Determine category from DeepSeek analysis
  private static determineCategoryFromAnalysis(analysis: any): string {
    const formNumber = analysis.document_details?.form_number;
    
    if (formNumber) {
      const categoryMap: Record<string, string> = {
        '31': 'Claims and Proofs',
        '47': 'Consumer Proposals', 
        '65': 'Bankruptcy Documents',
        '76': 'Financial Statements',
        '78': 'Trustee Documents',
        '85': 'Distribution Documents',
        '30': 'Notices',
        '32': 'Security Documents',
        '69': 'Creditor Communications',
        '79': 'Trustee Reports'
      };
      
      return categoryMap[formNumber] || 'BIA Forms';
    }
    
    return 'General Documents';
  }

  // Extract compliance issues
  private static extractComplianceIssues(analysis: any): string[] {
    const issues: string[] = [];
    
    const complianceStatus = analysis.comprehensive_risk_assessment?.compliance_status;
    if (complianceStatus) {
      if (!complianceStatus.bia_compliant) issues.push('BIA non-compliance');
      if (!complianceStatus.osb_compliant) issues.push('OSB non-compliance');
      if (complianceStatus.missing_requirements) {
        issues.push(...complianceStatus.missing_requirements);
      }
    }
    
    return issues;
  }

  // Extract client name from title if not found in analysis
  private static extractClientFromTitle(title: string): string {
    const patterns = [
      /^([A-Z][a-z]+ [A-Z][a-z]+)/,
      /([A-Z][a-z]+ [A-Z][a-z]+) -/,
      /client[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /debtor[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'Uncategorized Client';
  }

  // Store enhanced analysis results
  private static async storeEnhancedAnalysisResults(
    documentId: string, 
    result: DeepSeekDocumentAnalysisResult,
    rawAnalysis: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_document_analysis')
        .upsert({
          document_id: documentId,
          analysis_type: 'deepseek_enhanced',
          confidence_score: result.confidenceScore,
          extracted_data: result.extractedData,
          identified_form_type: result.formType,
          client_name_extracted: result.clientName,
          form_number: result.formNumber,
          risk_flags: result.riskFlags,
          processing_status: 'completed'
        });

      if (error) throw error;

      // Also store raw DeepSeek analysis for reference
      await supabase
        .from('document_analysis')
        .upsert({
          document_id: documentId,
          content: {
            deepseek_analysis: rawAnalysis,
            enhanced_extraction: result,
            analysis_timestamp: new Date().toISOString()
          }
        });

    } catch (error) {
      console.error('Failed to store enhanced analysis results:', error);
    }
  }

  // Utility function to chunk arrays
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Get existing analysis for a document
  static async getDocumentAnalysis(documentId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_document_analysis')
        .select('*')
        .eq('document_id', documentId)
        .eq('analysis_type', 'deepseek_enhanced')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Failed to get document analysis:', error);
      return null;
    }
  }
}
