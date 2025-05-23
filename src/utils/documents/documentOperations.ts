
import { supabase } from '@/lib/supabase';
import { safeStringCast, safeObjectCast } from '@/utils/typeGuards';

export const getDocumentWithAnalysis = async (documentId: string) => {
  try {
    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Get analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .single();

    let processedAnalysis = null;
    if (!analysisError && analysis) {
      const content = safeObjectCast(analysis.content);
      const risks = Array.isArray(content.risks) ? content.risks : [];
      const extractedInfo = safeObjectCast(content.extracted_info);

      processedAnalysis = {
        ...analysis,
        content: {
          ...content,
          risks,
          extracted_info: extractedInfo
        }
      };
    }

    return {
      success: true,
      document,
      analysis: processedAnalysis
    };

  } catch (error) {
    console.error('Error getting document with analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
