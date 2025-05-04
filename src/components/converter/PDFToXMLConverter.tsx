
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "./FileUploader";
import { ProcessingOptions } from "./ProcessingOptions";
import { XMLPreview } from "./XMLPreview";
import { ProcessingStatus } from "./ProcessingStatus";
import { useConverter } from "./hooks/useConverter";
import { FileSearch, Upload, Cog, FileCode, CheckIcon } from "lucide-react";

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
    { id: "upload", title: "Upload", icon: Upload, complete: !!uploadedFile },
    { id: "options", title: "Configure", icon: Cog, complete: !!conversionResult, disabled: !uploadedFile },
    { id: "results", title: "Results", icon: FileCode, complete: false, disabled: !conversionResult }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        {/* Progress stepper */}
        <nav aria-label="Progress">
          <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className="md:flex-1">
                <button
                  onClick={() => !step.disabled && setActiveTab(step.id)}
                  disabled={step.disabled}
                  className={`group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                    activeTab === step.id
                      ? "border-primary"
                      : step.complete
                      ? "border-primary/40"
                      : "border-muted"
                  } ${step.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <span className="flex items-center text-sm font-medium">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        activeTab === step.id
                          ? "bg-primary text-white"
                          : step.complete
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      } mr-2.5`}
                    >
                      {step.complete ? (
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <step.icon className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <span
                      className={
                        activeTab === step.id
                          ? "text-primary"
                          : step.complete
                          ? "text-primary/70"
                          : "text-muted-foreground"
                      }
                    >
                      {step.title}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 w-full">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="options" disabled={!uploadedFile}>Configure</TabsTrigger>
          <TabsTrigger value="results" disabled={!conversionResult}>Results</TabsTrigger>
        </TabsList>
        
        <div className="w-full">
          <TabsContent value="upload" className="space-y-4 animate-in fade-in-50 duration-300">
            <FileUploader 
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
              uploadedFile={uploadedFile}
              uploadProgress={uploadProgress}
            />
          </TabsContent>
          
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
