
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { ExcelData } from '../types';
import { extractClientNameFromWorksheet } from './clientNameExtractor';

/**
 * Processes Excel file data, extracting client name and content with optimized approach
 */
export const processExcelData = async (
  fileData: Blob,
  documentId: string | undefined,
  storagePath: string,
  setLoadingProgress: (progress: number) => void,
  setClientName: (name: string | null) => void
): Promise<{
  excelData: ExcelData | null;
  extractedClientName: string | null;
}> => {
  try {
    setLoadingProgress(40);
    
    // Process Excel in a non-blocking way
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Only read the first worksheet and limit to 10 rows for client name extraction
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      sheetRows: 10 // Limit initial read to just 10 rows for fast client name extraction
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Extract client name from the first few cells (quick scan)
    const extractedClientName = extractClientNameFromWorksheet(worksheet, storagePath);
    setClientName(extractedClientName);

    // Create notification if client name is detected
    if (documentId && extractedClientName) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.functions.invoke('handle-notifications', {
            body: {
              action: 'create',
              userId: user.id,
              notification: {
                title: 'Client Identified',
                message: `Client "${extractedClientName}" identified in financial data`,
                type: 'info',
                category: 'file_activity',
                priority: 'normal',
                action_url: `/documents/${documentId}`,
                metadata: {
                  documentId,
                  clientName: extractedClientName,
                  documentType: 'excel',
                  detectedAt: new Date().toISOString()
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("Error creating client detection notification:", error);
        // Continue processing even if notification fails
      }
    }

    // Update metadata with client name immediately
    if (documentId && extractedClientName) {
      await supabase
        .from('document_metadata')
        .upsert({
          document_id: documentId,
          extracted_metadata: {
            client_name: extractedClientName,
            last_processed: new Date().toISOString()
          }
        });
    }
    
    setLoadingProgress(60);
    
    // Now load a bit more data for the preview (up to 100 rows)
    const fullWorkbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      sheetRows: 100 // Limit to first 100 rows for preview
    });
    
    const fullWorksheet = fullWorkbook.Sheets[sheetName];
    const rawJson = XLSX.utils.sheet_to_json(fullWorksheet, { header: 1 });
    
    // Extract headers (first row)
    const headers = rawJson[0] as string[];
    
    // Only take first 99 rows for preview
    const rows = rawJson.slice(1, 100) as any[][];
    
    // Create metadata object
    const metadata = {
      fileName: storagePath.split('/').pop() || 'excel-file',
      sheetNames: fullWorkbook.SheetNames,
      totalSheets: fullWorkbook.SheetNames.length,
      totalRows: rows.length,
      totalColumns: headers.length
    };
    
    const excelData: ExcelData = {
      headers,
      rows,
      metadata
    };
    
    // Cache the extracted data
    if (documentId) {
      await supabase
        .from('document_metadata')
        .upsert({
          document_id: documentId,
          extracted_metadata: {
            excel_data: {
              headers,
              rows: rows.slice(0, 50), // Only cache first 50 rows to keep size small
              metadata
            },
            client_name: extractedClientName,
            last_processed: new Date().toISOString()
          }
        });
    }
    
    return { excelData, extractedClientName };
  } catch (err: any) {
    console.error('Error processing Excel file:', err);
    throw new Error(err.message || 'Failed to process Excel file');
  }
};
