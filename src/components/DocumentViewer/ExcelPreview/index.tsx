
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useExcelPreview } from './hooks/useExcelPreview';
import { ExcelTable } from './components/ExcelTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ExcelPreviewProps {
  documentId: string;
  storagePath: string;
}

interface ExcelTableProps {
  data: any;
}

const ExcelPreview = ({ documentId, storagePath }: ExcelPreviewProps) => {
  const { data, isLoading, error, sheets, activeSheet, setActiveSheet, downloadExcel, refresh } = useExcelPreview(documentId, storagePath);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-800">
        <h3 className="font-medium">Error loading Excel file</h3>
        <p className="text-sm mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || !sheets || sheets.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
        <h3 className="font-medium">No Excel data available</h3>
        <p className="text-sm mt-1">This file doesn't contain valid Excel data or is empty.</p>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b flex justify-between items-center">
        <Tabs value={activeSheet} onValueChange={setActiveSheet} className="flex-1">
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(sheets.length, 5)}, minmax(0, 1fr))` }}>
            {sheets.map(sheet => (
              <TabsTrigger key={sheet} value={sheet}>
                {sheet}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex ml-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadExcel}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {sheets.map(sheet => (
          <TabsContent key={sheet} value={sheet} className="h-full p-0 m-0">
            <ExcelTable data={data} />
          </TabsContent>
        ))}
      </div>
    </Card>
  );
};

export default ExcelPreview;
