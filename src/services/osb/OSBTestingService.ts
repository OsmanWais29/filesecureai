
import { supabase } from '@/lib/supabase';

export class OSBTestingService {
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

      // Validate documentId parameter
      if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
        throw new Error('Invalid document ID provided');
      }

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

      // Test document analysis with proper type handling
      const analysisResult = await supabase.functions.invoke('analyze-document', {
        body: {
          documentId: documentId, // Already validated as string above
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
