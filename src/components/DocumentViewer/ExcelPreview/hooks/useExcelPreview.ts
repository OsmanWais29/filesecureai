
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { ExcelData, ExcelSheetData } from '../types';

export const useExcelPreview = (url: string, documentId?: string) => {
  const [excelData, setExcelData] = useState<ExcelData>({ headers: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheets, setSheets] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [sheetData, setSheetData] = useState<ExcelSheetData[]>([]);

  const parseExcel = useCallback(async (arrayBuffer: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      setSheets(sheetNames);

      // Process all sheets
      const sheetsData: ExcelSheetData[] = [];
      
      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Extract columns (headers) from the first row
        const columns = jsonData[0] ? jsonData[0].map(col => String(col)) : [];
        
        // Format data for tabular display
        const formattedData: any[][] = jsonData.slice(1);
        
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
      const metadata = {
        fileName: documentId ? `Document ${documentId}` : 'Excel Document',
        sheetNames: sheetNames,
        totalSheets: sheetNames.length
      };
      
      setExcelData({
        headers: sheetsData[0]?.columns || [],
        rows: sheetsData[0]?.data || [],
        metadata: metadata
      });
      
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

  const processSheetData = useCallback((sheetInfo: ExcelSheetData) => {
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
      setExcelData(prev => ({
        ...prev,
        headers: sheetData[sheetIndex].columns || [],
        rows: sheetData[sheetIndex].data || []
      }));
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
