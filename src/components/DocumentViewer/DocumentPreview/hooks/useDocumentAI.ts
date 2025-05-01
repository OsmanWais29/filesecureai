
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch, ensureFreshToken } from "@/hooks/useAuthenticatedFetch";

export const useDocumentAI = (documentId: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const { toast } = useToast();

  const processDocument = useCallback(async () => {
    if (!documentId) {
      setError('No document ID provided');
      return null;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(10);

    try {
      // Ensure we have a fresh token for the request
      const isTokenValid = await ensureFreshToken();
      
      if (!isTokenValid) {
        throw new Error('Authentication error: Failed to refresh token');
      }
      
      setProgress(20);
      setAnalysisStatus('Starting analysis');

      // Update document status to processing
      await supabase
        .from('documents')
        .update({ 
          ai_processing_status: 'processing',
          metadata: {
            processing_started_at: new Date().toISOString(),
            processing_steps_completed: ['initiation']
          }
        })
        .eq('id', documentId);

      setProgress(30);
      setAnalysisStatus('Retrieving document content');

      // Get document details to access the storage path
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_path, title, type')
        .eq('id', documentId)
        .single();

      if (docError) {
        throw new Error(`Error retrieving document: ${docError.message}`);
      }
      
      if (!document?.storage_path) {
        throw new Error('Document has no storage path');
      }

      setProgress(40);
      setAnalysisStatus('Downloading document');

      // Download the document content
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(document.storage_path);
        
      if (fileError) {
        throw new Error(`Error downloading document: ${fileError.message}`);
      }

      setProgress(50);
      setAnalysisStatus('Processing document with AI');
      
      // Extract text from the document
      const text = await fileData.text();
      const isExcelFile = document.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      // Call the AI analysis edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('process-ai-request', {
        body: {
          documentId,
          includeRegulatory: true,
          includeClientExtraction: true,
          message: text.substring(0, 100000), // Limit size to avoid issues
          title: document.title,
          storagePath: document.storage_path,
          isExcelFile,
          extractionMode: 'comprehensive',
          debug: true
        }
      });

      if (analysisError) {
        throw new Error(`AI analysis error: ${analysisError.message}`);
      }

      setProgress(80);
      setAnalysisStatus('Saving analysis results');

      // Update the document with analysis results
      const extractedInfo = analysisData?.extracted_info || {};
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          ai_processing_status: 'complete',
          metadata: {
            ...extractedInfo,
            analyzed_at: new Date().toISOString(),
            has_analysis: true,
            processing_steps_completed: [
              'initiation', 
              'documentRetrieval', 
              'contentExtraction', 
              'aiProcessing', 
              'dataSaving', 
              'complete'
            ]
          }
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document with analysis results:', updateError);
        // Continue despite this error as the analysis itself was successful
      }

      setProgress(100);
      setAnalysisStatus('Analysis complete');
      toast({
        title: "Analysis Complete",
        description: "Document has been successfully analyzed",
      });
      
      return analysisData;
    } catch (err: any) {
      console.error('Document AI analysis error:', err);
      setError(err.message || 'An unknown error occurred');
      
      // Update document status to failed
      try {
        await supabase
          .from('documents')
          .update({ 
            ai_processing_status: 'failed',
            metadata: {
              processing_error: err.message,
              processing_failed_at: new Date().toISOString()
            }
          })
          .eq('id', documentId);
      } catch (updateErr) {
        console.error('Error updating document failure status:', updateErr);
      }
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "An error occurred during document analysis",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [documentId, toast]);

  return {
    processDocument,
    isProcessing,
    error,
    progress,
    analysisStatus
  };
};
