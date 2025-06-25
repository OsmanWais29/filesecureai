
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileUploader } from "./FileUploader";
import { useConverter } from "./hooks/useConverter";
import { 
  FileCode, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Zap,
  FileText,
  Settings,
  Play
} from "lucide-react";

export const PDFToXMLConverter = () => {
  const { 
    uploadedFile,
    uploadProgress,
    handleFileUpload,
    handleRemoveFile
  } = useConverter();

  const [isConverting, setIsConverting] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  const handleStartConversion = () => {
    if (!uploadedFile) return;
    
    setIsConverting(true);
    setConversionProgress(0);
    
    // Simulate conversion process
    const interval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsConverting(false);
          setConversionComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownload = () => {
    // Create a sample XML content
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <metadata>
    <filename>${uploadedFile?.name}</filename>
    <converted_at>${new Date().toISOString()}</converted_at>
  </metadata>
  <content>
    <text>Sample converted content from PDF</text>
  </content>
</document>`;
    
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadedFile?.name.replace('.pdf', '')}_converted.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <FileCode className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF to XML Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your PDF documents into structured XML format with our advanced AI-powered conversion technology
          </p>
        </div>

        {/* Main Conversion Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Step 1: Upload */}
          <Card className={`transition-all duration-300 ${!uploadedFile ? 'ring-2 ring-blue-500 ring-opacity-50' : 'opacity-75'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!uploadedFile ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {!uploadedFile ? <Upload className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                </div>
              </div>
              <CardTitle className="text-lg">Step 1: Upload PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center mb-4">
                Select your PDF document to begin the conversion process
              </p>
              <Badge variant={!uploadedFile ? "default" : "secondary"} className="mx-auto">
                {!uploadedFile ? "Waiting" : "Complete"}
              </Badge>
            </CardContent>
          </Card>

          {/* Step 2: Convert */}
          <Card className={`transition-all duration-300 ${uploadedFile && !isConverting && !conversionComplete ? 'ring-2 ring-orange-500 ring-opacity-50' : 'opacity-75'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isConverting ? 'bg-orange-100 text-orange-600' : 
                  conversionComplete ? 'bg-green-100 text-green-600' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isConverting ? <Zap className="h-6 w-6 animate-pulse" /> : 
                   conversionComplete ? <CheckCircle className="h-6 w-6" /> : 
                   <Settings className="h-6 w-6" />}
                </div>
              </div>
              <CardTitle className="text-lg">Step 2: Convert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center mb-4">
                AI processes your document and converts it to XML
              </p>
              <Badge variant={
                isConverting ? "default" : 
                conversionComplete ? "secondary" : 
                "outline"
              } className="mx-auto">
                {isConverting ? "Processing" : conversionComplete ? "Complete" : "Pending"}
              </Badge>
            </CardContent>
          </Card>

          {/* Step 3: Download */}
          <Card className={`transition-all duration-300 ${conversionComplete ? 'ring-2 ring-green-500 ring-opacity-50' : 'opacity-75'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${conversionComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Download className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-lg">Step 3: Download</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center mb-4">
                Download your converted XML file
              </p>
              <Badge variant={conversionComplete ? "default" : "outline"} className="mx-auto">
                {conversionComplete ? "Ready" : "Waiting"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* File Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Your PDF Document
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

        {/* Conversion Control */}
        {uploadedFile && !conversionComplete && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Convert to XML
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Converting your PDF...</span>
                    <span>{conversionProgress}%</span>
                  </div>
                  <Progress value={conversionProgress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={handleStartConversion}
                disabled={isConverting}
                className="w-full"
                size="lg"
              >
                {isConverting ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Conversion
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Download Section */}
        {conversionComplete && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Conversion Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-700">
                Your PDF has been successfully converted to XML format. You can now download the converted file.
              </p>
              
              <div className="flex gap-4">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download XML
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setConversionComplete(false);
                    setConversionProgress(0);
                    handleRemoveFile();
                  }}
                  className="flex-1"
                >
                  Convert Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">
                Lightning-fast conversion powered by advanced AI algorithms
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">High Accuracy</h3>
              <p className="text-sm text-gray-600">
                Precise text extraction and structure preservation
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <FileCode className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Clean XML Output</h3>
              <p className="text-sm text-gray-600">
                Well-structured XML with proper formatting and metadata
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
