
import { supabase } from '@/lib/supabase';
import { DeepSeekAnalysisResponse } from '@/types/osb-analysis';

export class OSBDeepSeekService {
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
   * Trigger DeepSeek AI analysis for a document with optional custom prompt
   */
  static async triggerDeepSeekAnalysis(
    documentId: string, 
    customPrompt?: string
  ): Promise<{
    success: boolean;
    analysisId?: string;
    reasoning?: string;
    error?: string;
  }> {
    try {
      console.log('Triggering DeepSeek analysis for document:', documentId);
      console.log('Custom prompt:', customPrompt);

      // Validate documentId parameter
      if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
        throw new Error('Invalid document ID provided');
      }

      const { data, error } = await supabase.functions.invoke('enhanced-osb-analysis', {
        body: {
          documentId: documentId,
          analysisType: 'deepseek_reasoning_reinforcement',
          customPrompt: customPrompt,
          includeRegulatory: true,
          enhancedExtraction: true,
          reinforcementLearning: true
        }
      });

      if (error) throw error;

      return {
        success: true,
        analysisId: data?.analysisId,
        reasoning: data?.reasoning,
      };

    } catch (error) {
      console.error('DeepSeek analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}
