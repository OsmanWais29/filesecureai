
import React, { useState } from 'react';
import { useExcelPreview } from './hooks/useExcelPreview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExcelTable from './components/ExcelTable';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ExcelPreviewProps {
  documentId: string;
  storagePath: string;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ documentId, storagePath }) => {
  const {
    data,
    isLoading,
    error,
    sheets,
    activeSheet,
    setActiveSheet,
    downloadExcel,
    refresh
  } = useExcelPreview(documentId, storagePath);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Loading Excel data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <p className="text-destructive font-medium mb-4">Error loading Excel data</p>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={refresh} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b">
        <Tabs value={activeSheet} onValueChange={setActiveSheet} className="w-full">
          <TabsList>
            {sheets.map((sheet) => (
              <TabsTrigger key={sheet} value={sheet}>
                {sheet}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={refresh} title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadExcel} title="Download Excel file">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {data ? (
          <ExcelTable data={data} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;
