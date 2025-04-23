
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Triggers OpenAI document analysis via edge function
 * @param documentId ID of the document to analyze
 */
export const triggerDocumentAnalysis = async (documentId: string): Promise<any> => {
  try {
    console.log(`Triggering analysis for document: ${documentId}`);
    
    // First, get the document details including storage path
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .single();
    
    if (docError) {
      console.error("Error fetching document:", docError);
      throw new Error(`Could not find document with ID: ${documentId}`);
    }
    
    if (!document?.storage_path) {
      throw new Error("Document has no storage path");
    }
    
    // Update document status to processing
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ai_processing_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
    
    if (updateError) {
      console.error("Error updating document status:", updateError);
      throw new Error("Failed to update document status");
    }
    
    console.log("Calling process-ai-request edge function");
    
    // Call the edge function to process the document
    const { data, error } = await supabase.functions.invoke('process-ai-request', {
      body: {
        documentId,
        storagePath: document.storage_path
      }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);
      
      throw new Error(`Analysis failed: ${error.message || 'Unknown error'}`);
    }
    
    console.log("Analysis process initiated successfully:", data);
    
    return data;
  } catch (error: any) {
    console.error("Document analysis error:", error);
    toast.error("Failed to analyze document", {
      description: error.message || "An unknown error occurred"
    });
    throw error;
  }
};
