
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploader } from './FileUploader';
import { ProcessingOptions } from './ProcessingOptions';
import { ConversionResults } from './ConversionResults';
import { ProcessingStatus } from './ProcessingStatus';
import { useConverter } from './hooks/useConverter';
import { FileText } from 'lucide-react';

export const DocumentConverter = () => {
  const {
    uploadedFile,
    uploadProgress,
    processingOptions,
    processingStatus,
    conversionResult,
    isProcessing,
    handleFileUpload,
    handleRemoveFile,
    handleOptionsChange,
    handleStartProcessing,
    handleBatchProcessing,
    handleDownloadXml
  } = useConverter();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            uploadedFile={uploadedFile}
            uploadProgress={uploadProgress}
          />
        </CardContent>
      </Card>

      {uploadedFile && (
        <>
          <ProcessingOptions
            options={processingOptions}
            onChange={handleOptionsChange}
            onStartProcessing={handleStartProcessing}
            onBatchProcessing={handleBatchProcessing}
            isProcessing={isProcessing}
            file={uploadedFile}
          />

          {isProcessing && (
            <ProcessingStatus
              status={processingStatus}
            />
          )}

          {conversionResult && (
            <ConversionResults
              result={conversionResult}
              onDownload={handleDownloadXml}
            />
          )}
        </>
      )}
    </div>
  );
};
