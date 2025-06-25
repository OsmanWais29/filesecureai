
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "./FileUploader";
import { ProcessingOptions } from "./ProcessingOptions";
import { XMLPreview } from "./XMLPreview";
import { ProcessingStatus } from "./ProcessingStatus";
import { useConverter } from "./hooks/useConverter";
import { FileCode } from "lucide-react";

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
    handleBatchProcessing,
    handleDownloadXml,
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
            <FileCode className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PDF to XML Converter</h1>
            <p className="text-gray-600">Advanced document conversion with AI-powered data extraction</p>
          </div>
        </div>
      </div>

      {/* File Upload Section - Now at the top */}
      <Card>
        <CardContent className="p-6">
          <FileUploader 
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            uploadedFile={uploadedFile}
            uploadProgress={uploadProgress}
          />
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 w-full">
          <TabsTrigger value="options" disabled={!uploadedFile}>Configure</TabsTrigger>
          <TabsTrigger value="results" disabled={!conversionResult}>Results</TabsTrigger>
        </TabsList>
        
        <div className="w-full">
          <TabsContent value="options" className="space-y-4 animate-in fade-in-50 duration-300">
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
          
          <TabsContent value="results" className="space-y-4 animate-in fade-in-50 duration-300">
            {conversionResult && (
              <XMLPreview 
                result={conversionResult} 
                onDownload={handleDownloadXml}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
