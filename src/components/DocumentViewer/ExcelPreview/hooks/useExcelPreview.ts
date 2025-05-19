
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { safeObjectCast, toSafeSpreadObject } from '@/utils/typeSafetyUtils';

export interface ExcelData {
  sheets: {
    name: string;
    data: any[][];
    columns: string[];
  }[];
  activeSheet: number;
  metadata: {
    fileName: string;
    sheetCount: number;
    lastModified?: string;
    client_name?: string;
  }
}

export const useExcelPreview = (storagePath: string | null, documentId?: string) => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<number>(0);

  useEffect(() => {
    const loadExcel = async () => {
      if (!storagePath) {
        setError('No storage path provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Check if we already have processed this excel file and stored it
        if (documentId) {
          const { data: document } = await supabase
            .from('documents')
            .select('metadata')
            .eq('id', documentId)
            .single();
            
          if (document?.metadata) {
            const metadata = toSafeSpreadObject(document.metadata);
            const excelDataFromMetadata = metadata.excel_data;
            
            if (excelDataFromMetadata) {
              setExcelData(safeObjectCast<ExcelData>(excelDataFromMetadata));
              setLoading(false);
              return;
            }
          }
        }
        
        // If we don't have cached data, download and process the file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('documents')
          .download(storagePath);
          
        if (downloadError) {
          throw new Error(`Failed to download Excel file: ${downloadError.message}`);
        }
        
        // Get the client name from document metadata if available
        let clientName = '';
        if (documentId) {
          const { data: document } = await supabase
            .from('documents')
            .select('metadata')
            .eq('id', documentId)
            .single();
            
          if (document?.metadata) {
            const metadata = toSafeSpreadObject(document.metadata);
            clientName = String(metadata.client_name || '');
          }
        }
        
        const arrayBuffer = await fileData.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const sheets = workbook.SheetNames.map(name => {
          const worksheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Extract column headers if available (first row)
          const columns = jsonData.length > 0 ? 
            (jsonData[0] as any[]).map(col => String(col || '')) : 
            [];
            
          return {
            name,
            data: jsonData,
            columns
          };
        });
        
        const newExcelData: ExcelData = {
          sheets,
          activeSheet: 0,
          metadata: {
            fileName: storagePath.split('/').pop() || '',
            sheetCount: sheets.length,
            lastModified: new Date().toISOString(),
            client_name: clientName
          }
        };
        
        setExcelData(newExcelData);
        
        // Store the processed data in document metadata for future access
        if (documentId) {
          await supabase
            .from('documents')
            .update({
              metadata: {
                excel_data: newExcelData,
                excel_processed: true,
                last_processed: new Date().toISOString()
              }
            })
            .eq('id', documentId);
        }
        
      } catch (err: any) {
        console.error('Error loading Excel file:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadExcel();
  }, [storagePath, documentId]);
  
  // Function to change active sheet
  const changeSheet = (sheetIndex: number) => {
    if (excelData && sheetIndex >= 0 && sheetIndex < excelData.sheets.length) {
      setActiveSheet(sheetIndex);
      setExcelData(prevData => 
        prevData ? { ...prevData, activeSheet: sheetIndex } : null
      );
    }
  };
  
  return {
    excelData,
    loading,
    error,
    activeSheet,
    changeSheet
  };
};
