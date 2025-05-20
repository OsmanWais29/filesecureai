
import React, { useState, useEffect } from "react";
import { useExcelPreview } from "./hooks/useExcelPreview";
import ExcelTable from "./components/ExcelTable"; // Fixed import
import ExcelHeaderActions from "./components/ExcelHeaderActions"; // Fixed import
import ExcelErrorDisplay from "./components/ExcelErrorDisplay"; // Fixed import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExcelPreviewProps {
  url: string;
  documentId?: string;
  title?: string;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({ url, documentId, title }) => {
  const [activeSheet, setActiveSheet] = useState(0);
  const { excelData, loading, error, activeSheet: currentSheet, changeSheet, refresh } = useExcelPreview(url);
  
  const handleRefresh = () => {
    refresh();
  };

  const handleSheetChange = (index: number) => {
    changeSheet(index);
  };

  // Generate data for the table from the excelData
  const tableData = React.useMemo(() => {
    if (!excelData || !excelData.headers || !excelData.rows) return [];
    
    return excelData.rows.map((row) => {
      const rowObj: Record<string, any> = {};
      excelData.headers.forEach((header, i) => {
        rowObj[header] = row[i] || '';
      });
      return rowObj;
    });
  }, [excelData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-muted-foreground">Loading spreadsheet...</span>
      </div>
    );
  }

  if (error) {
    return <ExcelErrorDisplay error={error} onRefresh={handleRefresh} publicUrl={url} />;
  }

  if (!excelData || !excelData.metadata?.sheetNames || excelData.metadata.sheetNames.length === 0) {
    return <ExcelErrorDisplay error="No sheets found in the spreadsheet" onRefresh={handleRefresh} publicUrl={url} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ExcelHeaderActions 
        title={title} 
        onRefresh={handleRefresh} 
        publicUrl={url} 
      />

      {excelData.metadata.sheetNames.length > 1 ? (
        <Tabs 
          value={String(activeSheet)} 
          onValueChange={(value) => handleSheetChange(parseInt(value))} 
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="px-1 border-b">
            {excelData.metadata.sheetNames.map((name, index) => (
              <TabsTrigger 
                key={index} 
                value={String(index)} 
                className="text-xs py-1"
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent 
            value={String(activeSheet)} 
            className="flex-1 overflow-auto p-0 m-0"
          >
            <ExcelTable 
              data={tableData} 
              enableSorting={true} 
              enableFiltering={true}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 overflow-auto">
          <ExcelTable 
            data={tableData} 
            enableSorting={true} 
            enableFiltering={true}
          />
        </div>
      )}
    </div>
  );
};

export default ExcelPreview;
