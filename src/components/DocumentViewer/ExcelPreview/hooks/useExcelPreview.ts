
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { ExcelSheetData, SheetMetadata } from '../types';

export const useExcelPreview = (url: string, documentId?: string) => {
  const [excelData, setExcelData] = useState<ExcelSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheets, setSheets] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [sheetData, setSheetData] = useState<Array<{
    name: string;
    data: any[][];
    columns: string[];
  }>>([]);

  const parseExcel = useCallback(async (arrayBuffer: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      setSheets(sheetNames);

      // Process all sheets
      const sheetsData: Array<{
        name: string;
        data: any[][];
        columns: string[];
      }> = [];
      
      // Track total rows and columns for metadata
      let totalRows = 0;
      let totalColumns = 0;
      
      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Extract columns (headers) from the first row
        const columns = jsonData[0] ? jsonData[0].map(col => String(col)) : [];
        
        // Format data for tabular display
        const formattedData: any[][] = jsonData.slice(1);
        
        // Update total counts
        totalRows += formattedData.length;
        totalColumns = Math.max(totalColumns, columns.length);
        
        sheetsData.push({
          name: sheetName,
          data: formattedData,
          columns: columns
        });
      }
      
      setSheetData(sheetsData);
      
      if (sheetsData.length > 0) {
        processSheetData(sheetsData[0]);
      }
      
      // Extract metadata for the full Excel file
      const metadata: SheetMetadata = {
        fileName: documentId ? `document_${documentId}.xlsx` : 'document.xlsx',
        sheetNames: sheetNames,
        totalSheets: sheetNames.length,
        totalRows: totalRows,
        totalColumns: totalColumns
      };
      
      if (sheetsData.length > 0) {
        setExcelData({
          headers: sheetsData[0]?.columns || [],
          rows: sheetsData[0]?.data || [],
          metadata: metadata,
          name: sheetsData[0]?.name,
          columns: sheetsData[0]?.columns,
          data: sheetsData[0]?.data
        });
      }
      
      return {
        sheetNames,
        sheetsData
      };
    } catch (err: any) {
      console.error('Error parsing Excel:', err);
      setError(err.message || 'Failed to parse Excel file');
      return null;
    }
  }, [documentId]);

  const processSheetData = useCallback((sheetInfo: {
    name: string;
    data: any[][];
    columns: string[];
  }) => {
    const { columns, data: rowData } = sheetInfo;
    
    // Convert data to format suitable for display
    const records = rowData.map(row => {
      const record: Record<string, any> = {};
      columns.forEach((col, index) => {
        record[col] = row[index];
      });
      return record;
    });
    
    setData(records);
  }, []);

  const changeSheet = useCallback((sheetIndex: number) => {
    if (sheetIndex >= 0 && sheetIndex < sheetData.length) {
      setActiveSheet(sheetIndex);
      processSheetData(sheetData[sheetIndex]);
      
      // Update excelData with current sheet info
      const currentSheet = sheetData[sheetIndex];
      setExcelData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          headers: currentSheet.columns || [],
          rows: currentSheet.data || [],
          name: currentSheet.name,
          columns: currentSheet.columns,
          data: currentSheet.data
        };
      });
    }
  }, [sheetData, processSheetData]);

  const fetchAndParseExcel = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch the Excel file from the provided URL
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      await parseExcel(arrayBuffer);
      
    } catch (err: any) {
      console.error('Error fetching Excel file:', err);
      setError(err.message || 'Failed to fetch Excel file');
    } finally {
      setLoading(false);
    }
  }, [url, parseExcel]);

  useEffect(() => {
    if (url) {
      fetchAndParseExcel();
    }
  }, [url, fetchAndParseExcel]);

  const refresh = useCallback(() => {
    fetchAndParseExcel();
  }, [fetchAndParseExcel]);

  const downloadExcel = useCallback(() => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = documentId ? `document_${documentId}.xlsx` : 'document.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [url, documentId]);

  return {
    excelData,
    loading,
    error,
    activeSheet,
    changeSheet,
    sheets,
    downloadExcel,
    refresh,
    data,
  };
};
