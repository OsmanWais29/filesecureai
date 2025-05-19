
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { saveAs } from '@/utils/fileSaver';
import { safeObjectCast, safeString, safeArrayCast } from '@/utils/typeSafetyUtils';

export const useExcelPreview = (documentId: string, storagePath: string) => {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>('');

  const fetchExcelData = useCallback(async () => {
    if (!documentId && !storagePath) {
      setError('Missing document information');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First check if we need to fetch the document record to get the storage path
      let finalStoragePath = storagePath;
      if (!finalStoragePath && documentId) {
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .select('storage_path, metadata')
          .eq('id', documentId)
          .maybeSingle();

        if (docError) throw docError;
        
        if (!doc || !doc.storage_path) {
          throw new Error('Document storage path not found');
        }

        finalStoragePath = safeString(doc.storage_path, '');
        if (!finalStoragePath) {
          throw new Error('Invalid storage path');
        }
      }

      // Fetch the document metadata to get Excel data
      const { data: document, error: metadataError } = await supabase
        .from('documents')
        .select('metadata')
        .eq(finalStoragePath ? 'storage_path' : 'id', finalStoragePath || documentId)
        .maybeSingle();

      if (metadataError) throw metadataError;
      
      if (!document || !document.metadata) {
        throw new Error('Document metadata not found');
      }
      
      const metadata = safeObjectCast(document.metadata);
      
      // Check if Excel data exists
      const excelData = metadata.excel_data;
      if (!excelData) {
        throw new Error('No Excel data available for this document');
      }

      // Get client name if available
      const clientNameValue = safeString(metadata.client_name, 'Unknown Client');
      setClientName(clientNameValue);

      // Process the Excel data
      if (Array.isArray(excelData)) {
        // If it's a simple array, treat as single sheet
        setData(excelData as Record<string, unknown>[]);
        setSheets(['Sheet1']);
        setActiveSheet('Sheet1');
      } else if (typeof excelData === 'object' && excelData !== null) {
        // If it's an object with sheet names as keys
        const sheetNames = Object.keys(excelData as Record<string, unknown>);
        if (sheetNames.length > 0) {
          setSheets(sheetNames);
          setActiveSheet(sheetNames[0]);
          
          const sheetData = (excelData as Record<string, unknown>)[sheetNames[0]];
          if (Array.isArray(sheetData)) {
            setData(sheetData as Record<string, unknown>[]);
          } else {
            throw new Error('Invalid Excel sheet data format');
          }
        } else {
          throw new Error('Excel file has no sheets');
        }
      } else {
        throw new Error('Invalid Excel data format');
      }
    } catch (err: any) {
      console.error('Error fetching Excel data:', err);
      setError(err.message || 'Failed to load Excel data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, storagePath]);

  // Download Excel file
  const downloadExcel = useCallback(async () => {
    try {
      if (!storagePath) {
        throw new Error('No storage path available for download');
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .download(storagePath);

      if (error) throw error;

      // Create a download blob and trigger download
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${clientName || 'excel_file'}.xlsx`);
    } catch (err: any) {
      console.error('Error downloading Excel file:', err);
      setError(err.message || 'Failed to download Excel file');
    }
  }, [storagePath, clientName]);

  // Function to refresh the data
  const refresh = useCallback(() => {
    return fetchExcelData();
  }, [fetchExcelData]);

  // Initial data fetch
  useEffect(() => {
    fetchExcelData();
  }, [fetchExcelData]);

  return {
    data,
    isLoading,
    error,
    sheets,
    activeSheet,
    setActiveSheet,
    downloadExcel,
    refresh,
    clientName
  };
};
