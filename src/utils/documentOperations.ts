
import { supabase } from '@/lib/supabase';
import { safeStringCast, safeObjectCast } from '@/utils/typeGuards';

export const updateDocumentMetadata = async (
  documentId: string,
  metadata: Record<string, any>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get existing document
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('metadata')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Safely merge metadata
    const existingMetadata = safeObjectCast(existingDoc?.metadata);
    const updatedMetadata = {
      ...existingMetadata,
      ...metadata,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('documents')
      .update({ 
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      throw error;
    }

    return { success: true, metadata: updatedMetadata };
  } catch (error) {
    console.error('Error updating document metadata:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const getDocumentAnalysis = async (documentId: string) => {
  try {
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, message: 'No analysis found' };
    }

    const content = safeObjectCast(data.content);
    const risks = Array.isArray(content.risks) ? content.risks : [];
    const extractedInfo = safeObjectCast(content.extracted_info);

    return {
      success: true,
      analysis: {
        ...data,
        content: {
          ...content,
          risks,
          extracted_info: extractedInfo
        }
      }
    };
  } catch (error) {
    console.error('Error fetching document analysis:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
