
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Search, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadDocumentWithEnhancedAnalysis } from '@/utils/enhancedDocumentUpload';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const DocumentManagementPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [enhancedAnalysisEnabled, setEnhancedAnalysisEnabled] = useState(true);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadDocumentWithEnhancedAnalysis(selectedFile, {
        onProgress: setUploadProgress,
        enableEnhancedAnalysis: enhancedAnalysisEnabled,
        clientName: 'Default Client' // You can enhance this to select actual client
      });

      if (result.success && result.documentId) {
        toast({
          title: "Upload successful",
          description: enhancedAnalysisEnabled 
            ? "Document uploaded and enhanced analysis started"
            : "Document uploaded successfully"
        });

        setSelectedFile(null);
        setUploadProgress(0);
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload document",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileTypeInfo = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    const formNumberMatch = lowerName.match(/form\s*(\d{1,2})/i);
    const isBiaDocument = /form|proposal|statement|bankruptcy|consumer|assignment|proof|claim|creditor|debtor|trustee/i.test(lowerName);
    
    return {
      formNumber: formNumberMatch ? formNumberMatch[1] : null,
      isBiaDocument,
      willAnalyze: isBiaDocument && enhancedAnalysisEnabled
    };
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile.name) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Upload Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document with AI Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={enhancedAnalysisEnabled}
                  onChange={(e) => setEnhancedAnalysisEnabled(e.target.checked)}
                  className="rounded"
                />
                <Brain className="h-4 w-4" />
                Enhanced BIA Analysis
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                className="cursor-pointer"
                disabled={isUploading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, XLSX, XLS
              </p>
            </div>
            
            {selectedFile && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>

                {fileInfo && (
                  <div className="flex flex-wrap gap-2">
                    {fileInfo.formNumber && (
                      <Badge variant="outline">
                        Form {fileInfo.formNumber}
                      </Badge>
                    )}
                    {fileInfo.isBiaDocument && (
                      <Badge variant="secondary">
                        BIA Document
                      </Badge>
                    )}
                    {fileInfo.willAnalyze && (
                      <Badge variant="default" className="gap-1">
                        <Zap className="h-3 w-3" />
                        Will Analyze
                      </Badge>
                    )}
                  </div>
                )}

                {enhancedAnalysisEnabled && fileInfo?.isBiaDocument && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Enhanced Analysis Enabled</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      This document will be automatically analyzed by DeepSeek AI for BIA compliance, 
                      risk assessment, and field extraction.
                    </p>
                  </div>
                )}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet.</p>
            <p className="text-sm">Upload your first document to get started with AI analysis.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagementPage;
