
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { toString } from '@/utils/typeSafetyUtils';

export interface UsePreviewStateParams {
  documentId: string;
  storagePath: string;
  onAnalysisComplete?: () => void;
  bypassAnalysis?: boolean;
}

export const usePreviewState = ({
  storagePath,
  documentId,
  onAnalysisComplete,
  bypassAnalysis = false
}: UsePreviewStateParams) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isExcelFile, setIsExcelFile] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkFile = useCallback(async () => {
    if (!storagePath) {
      setFileExists(false);
      setError('No storage path provided');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      if (data?.publicUrl) {
        setFileUrl(data.publicUrl);
        setFileExists(true);
        setError(null);
        
        // Determine file type from the extension
        const extension = storagePath.split('.').pop()?.toLowerCase();
        if (extension) {
          setIsExcelFile(['xlsx', 'xls', 'csv'].includes(extension));
          
          if (['pdf'].includes(extension)) {
            setFileType('pdf');
          } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            setFileType('image');
          } else if (['doc', 'docx'].includes(extension)) {
            setFileType('document');
          } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            setFileType('excel');
          } else {
            setFileType('other');
          }
        }
      } else {
        setFileUrl(null);
        setFileExists(false);
        setError('File not found in storage');
      }
    } catch (error: any) {
      console.error('Error checking file:', error);
      setFileUrl(null);
      setFileExists(false);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [storagePath]);

  useEffect(() => {
    if (storagePath) {
      checkFile();
    }
  }, [storagePath, checkFile]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await checkFile();
  }, [checkFile]);

  // Add properties required by PreviewState interface
  const analyzing = false;
  const analysisStep = '';
  const progress = 0;
  const processingStage = '';
  const session = null;
  const setSession = () => {};
  const handleAnalyzeDocument = async () => { return Promise.resolve(); };
  const isAnalysisStuck = { stuck: false, minutesStuck: 0 };
  const handleAnalysisRetry = () => {};
  const hasFallbackToDirectUrl = false;
  const networkStatus = 'online';
  const attemptCount = 0;
  const handleFullRecovery = async () => { return Promise.resolve(); };
  const forceRefresh = async () => { return Promise.resolve(); };
  const forceReload = 0;
  const errorDetails = null;
  const publicUrl = fileUrl || '';

  const isPdfFile = () => fileType === 'pdf';
  const isDocFile = () => fileType === 'doc' || fileType === 'docx';
  const isImageFile = () => ['jpg', 'jpeg', 'png', 'gif'].includes(fileType || '');
  const useDirectLink = false;
  const zoomLevel = 100;
  const onZoomIn = () => {};
  const onZoomOut = () => {};
  const onOpenInNewTab = () => {
    if (fileUrl) window.open(fileUrl, '_blank');
  };
  const onDownload = () => {};
  const onPrint = () => {};
  const iframeRef = { current: null };

  return {
    fileUrl,
    fileType,
    fileExists,
    isLoading,
    error,
    setError,
    refresh,
    checkFile,
    isExcelFile,
    previewError,
    setPreviewError,
    analyzing,
    analysisStep,
    progress,
    processingStage,
    session,
    setSession,
    handleAnalyzeDocument,
    isAnalysisStuck,
    handleAnalysisRetry,
    hasFallbackToDirectUrl,
    networkStatus,
    attemptCount,
    handleFullRecovery,
    forceRefresh,
    forceReload,
    errorDetails,
    isPdfFile,
    isDocFile,
    isImageFile,
    useDirectLink,
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onOpenInNewTab,
    onDownload,
    onPrint,
    iframeRef,
    publicUrl
  };
};
