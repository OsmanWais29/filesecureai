
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "./FileUploader";
import { ProcessingOptions } from "./ProcessingOptions";
import { XMLPreview } from "./XMLPreview";
import { ProcessingStatus } from "./ProcessingStatus";
import { useConverter } from "./hooks/useConverter";
import { ArrowRight, FileSearch, Upload, Cog, FileCode } from "lucide-react";

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

  const steps = [
    { id: "upload", title: "Upload", icon: Upload },
    { id: "options", title: "Configure", icon: Cog },
    { id: "results", title: "Results", icon: FileCode }
  ];

  return (
    <div>
      <div className="flex items-center justify-center mb-8 px-6 pt-6">
        <ol className="flex items-center w-full">
          {steps.map((step, i) => (
            <li key={step.id} className={`flex items-center ${i < steps.length - 1 ? 'w-full' : ''}`}>
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full 
                  ${activeTab === step.id 
                    ? 'bg-accent text-white' 
                    : activeTab === steps[i + 1]?.id || activeTab === steps[i + 2]?.id 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  } transition-colors duration-300`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span 
                className={`ms-3 text-sm font-medium ${activeTab === step.id 
                  ? 'text-accent' 
                  : activeTab === steps[i + 1]?.id || activeTab === steps[i + 2]?.id 
                    ? 'text-primary' 
                    : 'text-muted-foreground'}`}
              >
                {step.title}
              </span>
              {i < steps.length - 1 && (
                <div className="w-full flex items-center justify-center">
                  <ArrowRight 
                    className={`w-4 h-4 mx-4 ${
                      activeTab === steps[i + 1]?.id || activeTab === steps[i + 2]?.id 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto mb-6">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="options" disabled={!uploadedFile}>Configure</TabsTrigger>
          <TabsTrigger value="results" disabled={!conversionResult}>Results</TabsTrigger>
        </TabsList>
        
        <div className="w-full max-w-4xl mx-auto">
          <TabsContent value="upload" className="space-y-4 mx-auto">
            <div className="animate-in fade-in duration-500">
              <FileUploader 
                onFileUpload={handleFileUpload}
                onRemoveFile={handleRemoveFile}
                uploadedFile={uploadedFile}
                uploadProgress={uploadProgress}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4 mx-auto">
            <div className="animate-in fade-in duration-500">
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
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mx-auto">
            <div className="animate-in fade-in duration-500">
              {conversionResult && (
                <XMLPreview 
                  result={conversionResult} 
                  onDownload={handleDownloadXml}
                />
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
