
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
  const [sheets, setSheets] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[] | null>(null);

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
              const typedExcelData = safeObjectCast<ExcelData>(excelDataFromMetadata);
              setExcelData(typedExcelData);
              setSheets(typedExcelData.sheets.map(s => s.name));
              
              // Convert data for current active sheet to row objects
              if (typedExcelData.sheets.length > 0) {
                const activeSheetData = typedExcelData.sheets[activeSheet];
                const headers = activeSheetData.columns;
                
                // Convert raw data to row objects
                if (activeSheetData.data.length > 1) {
                  const rowObjects = activeSheetData.data.slice(1).map((row: any[]) => {
                    const obj: Record<string, any> = {};
                    headers.forEach((header, index) => {
                      obj[header] = row[index];
                    });
                    return obj;
                  });
                  
                  setData(rowObjects);
                } else {
                  setData([]);
                }
              }
              
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
        
        const sheetNames = workbook.SheetNames;
        const sheetArray = sheetNames.map(name => {
          const worksheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
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
          sheets: sheetArray,
          activeSheet: 0,
          metadata: {
            fileName: storagePath.split('/').pop() || '',
            sheetCount: sheetArray.length,
            lastModified: new Date().toISOString(),
            client_name: clientName
          }
        };
        
        setExcelData(newExcelData);
        setSheets(sheetArray.map(s => s.name));
        
        // Create row objects for the active sheet
        if (sheetArray.length > 0) {
          const activeSheetData = sheetArray[0];
          const headers = activeSheetData.columns;
          
          // Convert raw data to row objects
          if (activeSheetData.data.length > 1) {
            const rowObjects = activeSheetData.data.slice(1).map((row: any[]) => {
              const obj: Record<string, any> = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });
            
            setData(rowObjects);
          }
        }
        
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
  }, [storagePath, documentId, activeSheet]);
  
  // Function to change active sheet
  const changeSheet = (sheetIndex: string) => {
    const index = parseInt(sheetIndex, 10);
    if (excelData && sheets[index]) {
      setActiveSheet(index);
      
      // Update data for the new active sheet
      if (excelData.sheets[index]) {
        const activeSheetData = excelData.sheets[index];
        const headers = activeSheetData.columns;
        
        // Convert raw data to row objects
        if (activeSheetData.data.length > 1) {
          const rowObjects = activeSheetData.data.slice(1).map((row: any[]) => {
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          
          setData(rowObjects);
        } else {
          setData([]);
        }
      }
    }
  };

  // Function to download Excel file
  const downloadExcel = () => {
    if (storagePath) {
      const publicUrl = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath).data.publicUrl;
      
      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = publicUrl;
      link.setAttribute('download', excelData?.metadata?.fileName || 'download.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Function to refresh data
  const refresh = () => {
    setLoading(true);
    setError(null);
    setExcelData(null);
    setData(null);
    
    if (storagePath) {
      // Clear cached data and reload
      if (documentId) {
        supabase
          .from('documents')
          .update({
            metadata: {
              excel_processed: false,
            }
          })
          .eq('id', documentId)
          .then(() => {
            // Reload after cache is cleared
            setTimeout(() => {
              window.location.reload();
            }, 500);
          });
      } else {
        window.location.reload();
      }
    }
  };
  
  return {
    excelData,
    loading,
    error,
    activeSheet,
    changeSheet,
    sheets,
    downloadExcel,
    refresh,
    data
  };
};
