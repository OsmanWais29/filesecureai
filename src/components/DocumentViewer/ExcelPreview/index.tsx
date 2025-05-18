
import React, { useEffect, useState } from 'react';
import ExcelTable from './components/ExcelTable';
import ExcelHeaderActions from './components/ExcelHeaderActions';
import ExcelErrorDisplay from './components/ExcelErrorDisplay';
import { useExcelPreview } from './hooks/useExcelPreview';

interface ExcelPreviewProps {
  documentId: string;
  documentTitle?: string;
  metadata?: any;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  documentId,
  documentTitle,
  metadata
}) => {
  const {
    excelData,
    isLoading,
    error,
    selectedSheet,
    setSelectedSheet,
    sheetNames
  } = useExcelPreview(documentId, metadata);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return <ExcelErrorDisplay error={error} />;
  }

  return (
    <div className="flex flex-col h-full">
      <ExcelHeaderActions 
        documentTitle={documentTitle || 'Excel Document'} 
        selectedSheet={selectedSheet}
        setSelectedSheet={setSelectedSheet}
        sheetNames={sheetNames}
      />
      
      <div className="flex-grow overflow-auto">
        {excelData ? (
          <ExcelTable 
            data={excelData}
            sheet={selectedSheet}
          />
        ) : (
          <ExcelErrorDisplay error="No data available in this Excel file" />
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;
