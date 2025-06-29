
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuthState } from '@/hooks/useAuthState';

interface FileUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to upload documents"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(file);
    setUploadComplete(false);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create document record
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          file_path: filePath,
          status: 'uploaded',
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`
      });

      if (onUploadComplete && documentData) {
        onUploadComplete(documentData.id);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  if (uploadedFile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {uploadComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isUploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              ) : (
                <Button variant="outline" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
              </p>
            </div>
          )}

          {uploadComplete && (
            <div className="text-center text-sm text-green-600 font-medium">
              Upload completed successfully!
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop the file here' : 'Upload Document'}
          </p>
          <p className="text-gray-500 mb-4">
            Drag and drop your file or click to browse
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX
          </p>
          <Button variant="outline">
            Select File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
