
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadDocument } from '@/utils/documentOperations';
import { requestDocumentAnalysis } from '@/utils/documents/api/analysisApi';
import { safeStringCast } from '@/utils/typeGuards';

interface UploadResult {
  success: boolean;
  document?: {
    id: string;
    title: string;
    storage_path: string;
    [key: string]: any;
  };
  message?: string;
  error?: string;
}

export const DocumentManagementPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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
    try {
      const result = await uploadDocument(selectedFile, {
        uploaded_at: new Date().toISOString(),
        original_name: selectedFile.name
      }) as UploadResult;

      if (result.success && result.document) {
        const documentId = safeStringCast(result.document.id);
        const storagePath = safeStringCast(result.document.storage_path);
        const title = safeStringCast(result.document.title);
        
        toast({
          title: "Upload successful",
          description: result.message || "Document uploaded successfully"
        });

        // Trigger AI analysis
        try {
          await requestDocumentAnalysis({
            documentId,
            storagePath,
            title,
            includeRegulatory: true,
            includeClientExtraction: true
          });
          
          toast({
            title: "Analysis started",
            description: "AI analysis has been initiated for the document"
          });
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          toast({
            title: "Upload successful, analysis failed",
            description: "Document uploaded but AI analysis could not be started",
            variant: "destructive"
          });
        }

        setSelectedFile(null);
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
    }
  };

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

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
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
              />
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, XLSX, XLS
              </p>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
            
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
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
            <p className="text-sm">Upload your first document to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagementPage;
