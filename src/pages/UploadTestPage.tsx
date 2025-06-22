
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const UploadTestPage = () => {
  const handleUploadComplete = async (documentId: string) => {
    console.log('Upload completed for document:', documentId);
    toast.success('Document uploaded successfully!', {
      description: `Document ID: ${documentId}`
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Upload Test</h1>
            <p className="text-muted-foreground mt-2">
              Test the file upload pipeline with drag & drop or file selection
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>
                Upload PDF, Word, Excel, or image files. Supported formats: PDF, DOCX, XLSX, JPG, PNG, TIFF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>File validation and type detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure storage upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Metadata extraction and database record</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>AI processing and analysis (for special forms)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Notification system</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default UploadTestPage;
