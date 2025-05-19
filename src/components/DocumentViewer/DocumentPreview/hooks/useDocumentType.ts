
import { useState, useEffect } from 'react';

export const useDocumentType = (storagePath: string) => {
  const [fileType, setFileType] = useState<string | null>(null);
  const [isExcelFile, setIsExcelFile] = useState(false);
  const [isPdfFile, setIsPdfFile] = useState(false);
  const [isImageFile, setIsImageFile] = useState(false);
  const [isDocFile, setIsDocFile] = useState(false);
  const [fileExists, setFileExists] = useState(false);

  useEffect(() => {
    if (storagePath) {
      setFileExists(true);
      const extension = storagePath.split('.').pop()?.toLowerCase() || '';
      setFileType(extension);
      
      setIsExcelFile(extension === 'xlsx' || extension === 'xls' || extension === 'csv');
      setIsPdfFile(extension === 'pdf');
      setIsImageFile(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension));
      setIsDocFile(extension === 'doc' || extension === 'docx' || extension === 'rtf');
    } else {
      setFileExists(false);
      setFileType(null);
      setIsExcelFile(false);
      setIsPdfFile(false);
      setIsImageFile(false);
      setIsDocFile(false);
    }
  }, [storagePath]);

  return {
    fileType,
    isExcelFile,
    isPdfFile,
    isImageFile,
    isDocFile,
    fileExists
  };
};
