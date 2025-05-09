
import { supabase } from '@/lib/supabase';
import { extractTextFromPdf } from './pdfUtils';

export const handleDocumentUpload = async (
  file: File,
  documentId: string,
  updateProgress: (message: string, percentage?: number) => void
) => {
  let documentText = '';
  
  try {
    // Step 1: Initial processing (10%)
    updateProgress('Initializing document processing...', 10);
    
    if (file.type === 'application/pdf') {
      updateProgress('Processing PDF document...', 20);
      const arrayBuffer = await file.arrayBuffer();
      const result = await extractTextFromPdf(arrayBuffer);
      documentText = result.text;
      
      if (result.errors.length > 0) {
        console.warn(`PDF processing completed with ${result.errors.length} errors`);
        console.warn('Pages with errors:', result.errors.join(', '));
      }
      
      console.log(`Successfully processed ${result.successfulPages} of ${result.totalPages} pages`);
      updateProgress('PDF text extraction complete', 40);
    } else {
      const text = await file.text();
      documentText = text;
      updateProgress('Document text extracted', 40);
    }

    // Validate text content
    if (!documentText || documentText.trim().length === 0) {
      throw new Error('No text could be extracted from the document');
    }

    // Step 2: Document Analysis (40-80%)
    updateProgress('Analyzing document content...', 50);

    // Extract potential client name from document text (basic example)
    const metadata = {
      client_name: 'Uncategorized', // Default value
      processed_at: new Date().toISOString(),
      extraction_status: 'completed'
    };

    // Update document with metadata
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        metadata,
        type: file.type 
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // Continue with document analysis
    const { error } = await supabase.functions.invoke('analyze-document', {
      body: {
        documentText,
        documentId
      }
    });

    if (error) throw error;

    updateProgress('Document analysis completed successfully', 100);
  } catch (error) {
    console.error('Document processing error:', error);
    updateProgress('Error processing document');
    throw error;
  }
};

export const uploadToStorage = async (
  file: File,
  userId: string,
  updateProgress: (message: string, percentage?: number) => void
) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  updateProgress('Uploading document to secure storage...', 20);

  const { error: uploadError, data } = await supabase.storage
    .from('documents')
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) throw uploadError;

  updateProgress('Document uploaded, saving details...', 30);

  const { error: dbError, data: documentData } = await supabase
    .from('documents')
    .insert([
      {
        title: file.name,
        type: file.type,
        size: file.size,
        storage_path: fileName,
        url: data?.path || '',
        user_id: userId,
        metadata: {} // Initialize empty metadata
      }
    ])
    .select()
    .single();

  if (dbError) throw dbError;

  return { fileName, documentData };
};

export const cleanupUpload = async (fileName: string | null = null) => {
  if (fileName) {
    try {
      await supabase.storage.from('documents').remove([fileName]);
    } catch (error) {
      console.error('Error cleaning up failed upload:', error);
    }
  }
};
