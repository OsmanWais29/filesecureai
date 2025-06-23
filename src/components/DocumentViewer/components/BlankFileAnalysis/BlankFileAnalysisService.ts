
import { supabase } from '@/lib/supabase';

export interface BlankFileAnalysis {
  isBlank: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  fileSize: number;
  pageCount?: number;
}

export class BlankFileAnalysisService {
  static async analyzeBlankFile(documentId: string): Promise<BlankFileAnalysis | null> {
    try {
      // Get document details
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) return null;

      // Check file size first - very small files are likely blank
      const isSmallFile = document.size < 1024; // Less than 1KB
      
      // Call blank file detection edge function
      const { data: result, error: analysisError } = await supabase.functions.invoke('detect-blank-file', {
        body: {
          documentId,
          storagePath: document.storage_path,
          fileSize: document.size,
          fileType: document.type
        }
      });

      if (analysisError) {
        console.error('Blank file analysis failed:', analysisError);
        return null;
      }

      return {
        isBlank: result?.isBlank || isSmallFile,
        confidence: result?.confidence || (isSmallFile ? 95 : 0),
        issues: result?.issues || (isSmallFile ? ['File size extremely small'] : []),
        suggestions: result?.suggestions || [],
        fileSize: document.size,
        pageCount: result?.pageCount
      };

    } catch (error) {
      console.error('Blank file detection error:', error);
      return null;
    }
  }
}
