import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ExcelPreviewProps } from "./types";
import { getExcelDataFromMetadata, getClientNameFromMetadata } from "./services/cacheService";
import { createClientFolder } from "./services/folderOrganizationService";
import { ExcelTable } from "./ExcelTable";
import { ExcelHeaderActions } from "./ExcelHeaderActions";
import { ExcelErrorDisplay } from "./ExcelErrorDisplay";

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ storagePath, title }) => {
  const [excelData, setExcelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState('');
  const [documentId, setDocumentId] = useState('');

  useEffect(() => {
    const parts = storagePath.split('/');
    const filename = parts.pop();
    const id = filename?.split('.')[0];
    if (id) {
      setDocumentId(id);
    }
  }, [storagePath]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cachedData = {
        excel_data: null,
        document: null,
        client_name: null,
      };

      // Check if processing is complete with safe type checking
      const isProcessingComplete = 
        cachedData.document?.metadata && 
        typeof cachedData.document.metadata === 'object' && 
        'processing_complete' in cachedData.document.metadata && 
        cachedData.document.metadata.processing_complete === true;

      if (!isProcessingComplete) {
        // Create client folder if processing is not complete
        await createClientFolder(documentId, cachedData.document);
      }

      // Extract Excel data from metadata
      const excelData = getExcelDataFromMetadata(cachedData.document);
      if (excelData) {
        setExcelData(excelData);
      } else {
        setError("Excel data not found in document metadata.");
      }

      // Extract client name from metadata
      const clientName = getClientNameFromMetadata(cachedData.document);
      if (clientName) {
        // Set client name if found
      }

      // Set public URL
      setPublicUrl(storagePath);
    } catch (error) {
      setError("Failed to load Excel data.");
      console.error("Error fetching Excel data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchData();
    }
  }, [documentId]);

  const handleRefresh = () => {
    fetchData();
    toast("Refreshing Excel data...");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Loading spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ExcelErrorDisplay
        error={error}
        onRefresh={handleRefresh}
        publicUrl={publicUrl}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ExcelHeaderActions
        title={title}
        onRefresh={handleRefresh}
        publicUrl={publicUrl}
      />
      {excelData && (
        <div className="flex-grow overflow-auto">
          <ExcelTable data={excelData} enableSorting enableFiltering />
        </div>
      )}
    </div>
  );
};

export default ExcelPreview;
