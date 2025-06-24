
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
   * Fetch existing document analysis from the new schema
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
   * Create new document analysis record with improved structure
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
      },
      last_updated: new Date().toISOString(),
      manual_edits: true
    };
    
    logger.info("Creating new document analysis record", { documentId, userId });
    
    const { error } = await supabase
      .from('document_analysis')
      .insert([{ 
        document_id: documentId,
        user_id: userId,
        content: updatedContent,
        form_type: formType,
        confidence_score: 1.0, // Manual entries get full confidence
        client_name: editedValues.client_name || editedValues.clientName || null,
        estate_number: editedValues.estate_number || editedValues.estateNumber || null
      }]);
      
    if (error) {
      logger.error("Error creating document analysis:", error);
      throw error;
    }
    
    return true;
  },
  
  /**
   * Update existing document analysis record with new structure
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
      },
      last_updated: new Date().toISOString(),
      manual_edits: true
    };
    
    logger.info("Updating document analysis record", { documentId, userId });
    
    const { error } = await supabase
      .from('document_analysis')
      .update({ 
        content: updatedContent,
        form_type: formType,
        client_name: editedValues.client_name || editedValues.clientName || null,
        estate_number: editedValues.estate_number || editedValues.estateNumber || null,
        updated_at: new Date().toISOString()
      })
      .eq('document_id', documentId)
      .eq('user_id', userId);
      
    if (error) {
      logger.error("Error updating document analysis:", error);
      throw error;
    }
    
    return true;
  },

  /**
   * Get form-specific data from dynamic tables
   */
  async getFormSpecificData(documentId: string, formNumber: string) {
    try {
      const tableName = `form_${formNumber}_data`.toLowerCase();
      
      // Check if table exists
      const { data: tableExists } = await supabase
        .from('dynamic_form_tables')
        .select('table_name, table_schema')
        .eq('form_number', formNumber)
        .single();

      if (!tableExists) {
        logger.info(`No dynamic table found for Form ${formNumber}`);
        return null;
      }

      // Fetch data from the dynamic table via edge function
      const { data: formData, error } = await supabase.functions.invoke('query-form-data', {
        body: {
          tableName: tableExists.table_name,
          documentId,
          formNumber
        }
      });

      if (error) {
        logger.error("Error fetching form-specific data:", error);
        return null;
      }

      return formData;
    } catch (error) {
      logger.error("Error in getFormSpecificData:", error);
      return null;
    }
  },

  /**
   * Update form-specific data in dynamic tables
   */
  async updateFormSpecificData(documentId: string, formNumber: string, data: Record<string, any>) {
    try {
      const tableName = `form_${formNumber}_data`.toLowerCase();
      
      // Update via edge function
      const { error } = await supabase.functions.invoke('update-form-data', {
        body: {
          tableName,
          documentId,
          formNumber,
          data
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error("Error updating form-specific data:", error);
      return false;
    }
  }
};
