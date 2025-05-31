
// OSB Analysis Service - Enhanced DeepSeek Integration
import { supabase } from '@/lib/supabase';
import { DeepSeekAnalysisResponse, OSBFormAnalysis, IdentifiedRisk } from '@/types/osb-analysis';

export class OSBAnalysisService {
  /**
   * Analyze OSB document using enhanced DeepSeek prompts
   */
  static async analyzeDocument(
    documentText: string, 
    formNumber?: string,
    userId?: string
  ): Promise<DeepSeekAnalysisResponse> {
    try {
      // Call enhanced DeepSeek analysis edge function
      const { data, error } = await supabase.functions.invoke('enhanced-osb-analysis', {
        body: {
          documentText,
          formNumber,
          userId,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      return data.analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  /**
   * Get analysis by ID with related data
   */
  static async getAnalysisById(id: string): Promise<OSBFormAnalysis | null> {
    const { data, error } = await supabase
      .from('osb_form_analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as unknown as OSBFormAnalysis;
  }

  /**
   * Get analyses by form number
   */
  static async getAnalysesByForm(formNumber: string, limit = 50): Promise<OSBFormAnalysis[]> {
    const { data, error } = await supabase
      .from('osb_form_analyses')
      .select('*')
      .eq('form_number', formNumber)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as unknown as OSBFormAnalysis[]) || [];
  }

  /**
   * Get high-risk analyses
   */
  static async getHighRiskAnalyses(limit = 100): Promise<OSBFormAnalysis[]> {
    const { data, error } = await supabase
      .from('osb_form_analyses')
      .select('*')
      .eq('overall_risk_level', 'high')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as unknown as OSBFormAnalysis[]) || [];
  }

  /**
   * Get compliance summary
   */
  static async getComplianceSummary(dateFrom?: Date, dateTo?: Date): Promise<any> {
    let query = supabase
      .from('osb_analysis_dashboard')
      .select('*');

    if (dateFrom) {
      query = query.gte('analysis_date', dateFrom.toISOString());
    }
    if (dateTo) {
      query = query.lte('analysis_date', dateTo.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get OSB forms reference data
   */
  static async getOSBFormsReference(): Promise<any[]> {
    const { data, error } = await supabase
      .from('osb_forms_reference')
      .select('*')
      .eq('is_active', true)
      .order('form_number');

    if (error) throw error;
    return data || [];
  }

  /**
   * Update risk resolution status
   */
  static async updateRiskResolution(
    riskId: string, 
    resolved: boolean, 
    resolutionNotes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('osb_risk_assessments')
      .update({
        resolved,
        resolution_notes: resolutionNotes,
      })
      .eq('id', riskId);

    if (error) throw error;
  }

  /**
   * Test PDF extraction and analysis
   */
  static async testPDFAnalysis(documentId: string): Promise<{
    pdfAccessible: boolean;
    extractionSuccess: boolean;
    analysisSuccess: boolean;
    error?: string;
  }> {
    try {
      console.log('Testing PDF analysis for document:', documentId);

      // Test PDF accessibility
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_path, title')
        .eq('id', documentId)
        .single();

      if (docError) {
        throw new Error(`Document fetch error: ${docError.message}`);
      }

      // Test PDF URL generation
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(document.storage_path);

      console.log('PDF URL generated:', urlData.publicUrl);

      // Test document analysis
      const analysisResult = await supabase.functions.invoke('analyze-document', {
        body: {
          documentId: String(documentId),
          extractionMode: 'comprehensive',
          includeRegulatory: true
        }
      });

      console.log('Analysis result:', analysisResult);

      return {
        pdfAccessible: true,
        extractionSuccess: !analysisResult.error,
        analysisSuccess: analysisResult.data?.success || false,
        error: analysisResult.error?.message
      };

    } catch (error) {
      console.error('PDF analysis test error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        pdfAccessible: false,
        extractionSuccess: false,
        analysisSuccess: false,
        error: errorMessage
      };
    }
  }
}
