
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cacheService } from '../services/cacheService';

export const useExcelPreview = (documentId: string, metadata?: any) => {
  const [excelData, setExcelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  useEffect(() => {
    const loadExcelData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to get cached data first
        const cached = await cacheService.getExcelData(documentId);
        
        if (cached) {
          console.log('Using cached Excel data');
          setExcelData(cached.data);
          
          // Set sheet names from cached data
          if (cached.data) {
            const sheets = Object.keys(cached.data);
            setSheetNames(sheets);
            setSelectedSheet(sheets[0] || '');
          }
          
          setIsLoading(false);
          return;
        }

        // If no cache, check if metadata has Excel data
        if (metadata?.excel_data) {
          console.log('Using Excel data from metadata');
          setExcelData(metadata.excel_data);
          
          // Set sheet names from metadata
          if (metadata.excel_data) {
            const sheets = Object.keys(metadata.excel_data);
            setSheetNames(sheets);
            setSelectedSheet(sheets[0] || '');
          }
          
          // Cache the data for future use
          await cacheService.saveExcelData(documentId, metadata.excel_data, metadata.client_name);
          
          setIsLoading(false);
          return;
        }

        // If not in cache or metadata, fetch from document in storage
        const { data, error } = await supabase
          .from('documents')
          .select('metadata, storage_path')
          .eq('id', documentId)
          .single();

        if (error) throw error;
        
        if (!data) {
          throw new Error('Document not found');
        }
        
        // Check if the metadata contains Excel data
        if (data.metadata?.excel_data) {
          setExcelData(data.metadata.excel_data);
          
          // Set sheet names
          const sheets = Object.keys(data.metadata.excel_data);
          setSheetNames(sheets);
          setSelectedSheet(sheets[0] || '');
          
          // Cache the data
          await cacheService.saveExcelData(
            documentId, 
            data.metadata.excel_data, 
            data.metadata?.client_name
          );
        } else {
          // No Excel data found
          throw new Error('No Excel data available for this document');
        }
      } catch (err: any) {
        console.error('Error loading Excel data:', err);
        setError(err.message || 'Failed to load Excel data');
      } finally {
        setIsLoading(false);
      }
    };

    loadExcelData();
  }, [documentId, metadata]);

  return {
    excelData,
    isLoading,
    error,
    sheetNames,
    selectedSheet,
    setSelectedSheet
  };
};
