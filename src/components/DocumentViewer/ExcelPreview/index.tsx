
import React, { useState } from 'react';
import { useExcelPreview } from './hooks/useExcelPreview';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import ExcelTable from './components/ExcelTable';

interface ExcelPreviewProps {
  url: string;
  documentId?: string;
  title?: string;
}

const ExcelViewer: React.FC<ExcelPreviewProps> = ({ url, documentId, title }) => {
  const { 
    excelData, 
    loading: isLoading, 
    error, 
    activeSheet, 
    changeSheet,
    sheets,
    downloadExcel,
    refresh,
    data
  } = useExcelPreview(url, documentId);
  
  const [activeTab, setActiveTab] = useState<string>('0');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load spreadsheet</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={refresh} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    changeSheet(parseInt(value, 10));
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b p-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">{title || excelData.metadata?.fileName || 'Excel Document'}</h3>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={downloadExcel}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b px-2">
          <TabsList>
            {sheets.map((sheetName, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                {sheetName}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          {sheets.map((_, index) => (
            <TabsContent key={index} value={index.toString()} className="h-full">
              {activeTab === index.toString() && (
                <ExcelTable data={data} />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </Card>
  );
};

export default ExcelViewer;
