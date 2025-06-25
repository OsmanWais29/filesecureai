
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileUploader } from "./FileUploader";
import { useConverter } from "./hooks/useConverter";
import { FileCode } from "lucide-react";

export const PDFToXMLConverter = () => {
  const { 
    uploadedFile,
    uploadProgress,
    handleFileUpload,
    handleRemoveFile
  } = useConverter();

  return (
    <div className="p-6 space-y-6">
      {/* File Upload Section - At the very top */}
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

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
            <FileCode className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PDF to XML Converter</h1>
            <p className="text-gray-600">Upload your PDF documents for processing</p>
          </div>
        </div>
      </div>
    </div>
  );
};
