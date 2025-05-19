
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DocumentTypeResult {
  fileExists: boolean;
  isExcelFile: boolean;
  isPdfFile: boolean;
  isDocFile: boolean;
  isImageFile: boolean;
  fileType: string | null;
  checkFileExistence: () => Promise<boolean>;
}

export const useDocumentType = (storagePath: string): DocumentTypeResult => {
  const [fileExists, setFileExists] = useState<boolean>(false);
  const [isExcelFile, setIsExcelFile] = useState<boolean>(false);
  const [isPdfFile, setIsPdfFile] = useState<boolean>(false);
  const [isDocFile, setIsDocFile] = useState<boolean>(false);
  const [isImageFile, setIsImageFile] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string | null>(null);

  const determineFileType = useCallback((path: string): void => {
    if (!path) return;
    
    const lowerPath = path.toLowerCase();
    
    // Check file extensions
    const isExcel = lowerPath.endsWith('.xlsx') || 
                   lowerPath.endsWith('.xls') || 
                   lowerPath.endsWith('.csv');
                   
    const isPdf = lowerPath.endsWith('.pdf');
    
    const isDoc = lowerPath.endsWith('.doc') || 
                 lowerPath.endsWith('.docx');
                 
    const isImage = lowerPath.endsWith('.jpg') || 
                   lowerPath.endsWith('.jpeg') || 
                   lowerPath.endsWith('.png') || 
                   lowerPath.endsWith('.gif');
    
    // Set states
    setIsExcelFile(isExcel);
    setIsPdfFile(isPdf);
    setIsDocFile(isDoc);
    setIsImageFile(isImage);
    
    // Determine file type
    if (isExcel) setFileType('excel');
    else if (isPdf) setFileType('pdf');
    else if (isDoc) setFileType('document');
    else if (isImage) setFileType('image');
    else setFileType('unknown');
    
  }, []);

  const checkFileExistence = useCallback(async (): Promise<boolean> => {
    if (!storagePath) {
      setFileExists(false);
      return false;
    }

    try {
      // Get the public URL
      const { data } = await supabase
        .storage
        .from('documents')
        .getPublicUrl(storagePath);
        
      if (data && data.publicUrl) {
        // If we get a public URL, the file likely exists
        setFileExists(true);
        return true;
      } else {
        setFileExists(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking file existence:', error);
      setFileExists(false);
      return false;
    }
  }, [storagePath]);

  useEffect(() => {
    if (storagePath) {
      determineFileType(storagePath);
      checkFileExistence();
    }
  }, [storagePath, determineFileType, checkFileExistence]);

  return {
    fileExists,
    isExcelFile,
    isPdfFile,
    isDocFile,
    isImageFile,
    fileType,
    checkFileExistence
  };
};
