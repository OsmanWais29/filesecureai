
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "./FileUploader";
import { ProcessingOptions } from "./ProcessingOptions";
import { XMLPreview } from "./XMLPreview";
import { ProcessingStatus } from "./ProcessingStatus";
import { ConversionResult } from "./types";
import { useConverter } from "./hooks/useConverter";

export const PDFToXMLConverter = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const { 
    uploadedFile,
    processingOptions,
    conversionResult,
    processingStatus,
    uploadProgress,
    handleFileUpload,
    handleRemoveFile,
    handleOptionsChange,
    handleStartProcessing,
    handleDownloadXml,
    handleBatchProcessing,
    isProcessing
  } = useConverter();

  // Move to next tab after successful upload
  React.useEffect(() => {
    if (uploadedFile && activeTab === "upload") {
      setActiveTab("options");
    }
  }, [uploadedFile, activeTab]);

  // Move to results tab after processing completes
  React.useEffect(() => {
    if (conversionResult && activeTab === "options") {
      setActiveTab("results");
    }
  }, [conversionResult, activeTab]);

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>PDF to XML Converter</span>
        </CardTitle>
        <CardDescription>
          Convert your PDF statements into structured XML format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="options" disabled={!uploadedFile}>Configure</TabsTrigger>
            <TabsTrigger value="results" disabled={!conversionResult}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <FileUploader 
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
              uploadedFile={uploadedFile}
              uploadProgress={uploadProgress}
            />
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4">
            <ProcessingOptions 
              options={processingOptions}
              onChange={handleOptionsChange}
              onStartProcessing={handleStartProcessing}
              onBatchProcessing={handleBatchProcessing}
              isProcessing={isProcessing}
              file={uploadedFile}
            />
            
            {isProcessing && (
              <ProcessingStatus status={processingStatus} />
            )}
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {conversionResult && (
              <XMLPreview 
                result={conversionResult} 
                onDownload={handleDownloadXml}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
