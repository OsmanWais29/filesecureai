
import { useState, useEffect } from 'react';
import { getPdfViewUrl, checkPdfExists, PdfLoadResult } from '@/utils/pdfViewer';

interface UsePdfViewerOptions {
  autoLoad?: boolean;
  bucketName?: string;
  onSuccess?: (result: PdfLoadResult) => void;
  onError?: (error: any) => void;
}

export function usePdfViewer(
  storagePath: string | undefined | null, 
  options: UsePdfViewerOptions = {}
) {
  const {
    autoLoad = true,
    bucketName = 'documents',
    onSuccess,
    onError
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [fileExists, setFileExists] = useState(false);
  const [pdfResult, setPdfResult] = useState<PdfLoadResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);
  
  const loadPdf = async (forceFallback = false) => {
    if (!storagePath) {
      setError(new Error('No storage path provided'));
      if (onError) onError(new Error('No storage path provided'));
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if file exists first
      const exists = await checkPdfExists(storagePath, bucketName);
      setFileExists(exists);
      
      if (!exists) {
        throw new Error(`PDF file not found: ${storagePath}`);
      }
      
      // Get PDF URL with automatic fallbacks
      const result = await getPdfViewUrl(storagePath, bucketName, {
        forceGoogleViewer: forceFallback,
        maxRetries: forceFallback ? 0 : 2
      });
      
      if (result.success) {
        setPdfResult(result);
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        throw new Error(result.error?.toString() || 'Failed to load PDF');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
      setAttempts(prev => prev + 1);
    }
  };
  
  // Auto load on mount if enabled
  useEffect(() => {
    if (autoLoad && storagePath) {
      loadPdf();
    }
  }, [storagePath, autoLoad]);
  
  const retryWithFallback = () => loadPdf(true);
  const retry = () => loadPdf(false);
  
  return {
    isLoading,
    fileExists,
    pdfUrl: pdfResult?.url || null,
    pdfResult,
    error,
    attempts,
    retry,
    retryWithFallback
  };
}
