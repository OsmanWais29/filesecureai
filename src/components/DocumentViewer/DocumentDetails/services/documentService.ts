
import { supabase } from "@/lib/supabase";
import logger from "@/utils/logger";

interface DocumentUpdateData {
  documentId: string;
  userId: string;
  formType: string;
  editedValues: Record<string, string>;
  existingContent?: any;
}

export const documentService = {
  /**
   * Fetch existing document analysis
   */
  async getDocumentAnalysis(documentId: string, userId: string) {
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      logger.error("Error fetching document analysis:", error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Create new document analysis record
   */
  async createDocumentAnalysis({
    documentId,
    userId,
    formType,
    editedValues
  }: DocumentUpdateData) {
    const updatedContent = {
      extracted_info: {
        ...editedValues,
        type: formType
      }
    };
    
    logger.info("Creating new document analysis record", { documentId, userId });
    
    const { error } = await supabase
      .from('document_analysis')
      .insert([{ 
        document_id: documentId,
        user_id: userId,
        content: updatedContent 
      }]);
      
    if (error) {
      logger.error("Error creating document analysis:", error);
      throw error;
    }
    
    return true;
  },
  
  /**
   * Update existing document analysis record
   */
  async updateDocumentAnalysis({
    documentId,
    userId,
    formType,
    editedValues,
    existingContent
  }: DocumentUpdateData) {
    const updatedContent = {
      ...existingContent,
      extracted_info: {
        ...(existingContent?.extracted_info || {}),
        ...editedValues,
        type: formType
      }
    };
    
    logger.info("Updating document analysis record", { documentId, userId });
    
    const { error } = await supabase
      .from('document_analysis')
      .update({ content: updatedContent })
      .eq('document_id', documentId)
      .eq('user_id', userId);
      
    if (error) {
      logger.error("Error updating document analysis:", error);
      throw error;
    }
    
    return true;
  }
};
