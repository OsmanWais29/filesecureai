
import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "../../types";
import { updateAnalysisStatus } from "../documentStatusUpdates";
import { AnalysisProcessContext } from "../types";
import { isUUID } from "@/utils/validation";
import { toSafeSpreadObject } from "@/utils/typeSafetyUtils";

export const documentIngestion = async (
  storagePath: string,
  context: AnalysisProcessContext
): Promise<DocumentRecord> => {
  const { setAnalysisStep, setProgress, setError } = context;
  
  setAnalysisStep("Stage 1: Document Ingestion & Preprocessing...");
  setProgress(10);
  
  console.log('Fetching document record for path:', storagePath);
  const { data: documentRecord, error: fetchError } = await supabase
    .from('documents')
    .select('id, title, metadata, ai_processing_status, storage_path')
    .eq('storage_path', storagePath)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching document record:', fetchError);
    throw fetchError;
  }
  
  if (!documentRecord) {
    console.error('Document record not found for path:', storagePath);
    
    // Try to find by partial matching on the path
    const pathParts = storagePath.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Try to find by title match if no exact storage_path match
    const { data: documentByTitle, error: titleError } = await supabase
      .from('documents')
      .select('id, title, metadata, ai_processing_status, storage_path')
      .filter('title', 'eq', filename)
      .maybeSingle();
      
    if (titleError) {
      console.error('Error fetching document by title:', titleError);
    }
    
    if (documentByTitle) {
      console.log('Found document by title match:', documentByTitle);
      
      // Create properly typed document record
      const typedDocument: DocumentRecord = {
        id: String(documentByTitle.id),
        title: String(documentByTitle.title || ''),
        metadata: toSafeSpreadObject(documentByTitle.metadata),
        ai_processing_status: documentByTitle.ai_processing_status ? String(documentByTitle.ai_processing_status) : undefined,
        storage_path: documentByTitle.storage_path ? String(documentByTitle.storage_path) : undefined
      };
      
      // Update storage_path if it's missing
      if (!typedDocument.storage_path) {
        const { error: updateError } = await supabase
          .from('documents')
          .update({ storage_path: storagePath })
          .eq('id', typedDocument.id);
          
        if (updateError) {
          console.error('Error updating storage path:', updateError);
        } else {
          console.log('Updated storage_path for document:', typedDocument.id);
          typedDocument.storage_path = storagePath;
        }
      }
      
      await updateAnalysisStatus(typedDocument, 'document_ingestion', 'analysis_started');
      return typedDocument;
    }
    
    throw new Error('Document record not found in database');
  }
  
  console.log('Document record found:', documentRecord);
  
  // Create properly typed document record
  const typedDocumentRecord: DocumentRecord = {
    id: String(documentRecord.id),
    title: String(documentRecord.title || ''),
    metadata: toSafeSpreadObject(documentRecord.metadata),
    ai_processing_status: documentRecord.ai_processing_status ? String(documentRecord.ai_processing_status) : undefined,
    storage_path: documentRecord.storage_path ? String(documentRecord.storage_path) : undefined
  };
  
  // Ensure storage_path is set
  if (!typedDocumentRecord.storage_path) {
    console.log('Document missing storage_path, updating...');
    const { error: updateError } = await supabase
      .from('documents')
      .update({ storage_path: storagePath })
      .eq('id', typedDocumentRecord.id);
      
    if (updateError) {
      console.error('Error updating storage path:', updateError);
    } else {
      typedDocumentRecord.storage_path = storagePath;
    }
  }
  
  // Update document status to processing
  await updateAnalysisStatus(typedDocumentRecord, 'document_ingestion', 'analysis_started');
  
  return typedDocumentRecord;
};
