
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
          storage_path: filePath,
          type: file.type,
          size: file.size,
          user_id: user.id,
          ai_processing_status: 'pending'
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
        description: `${file.name} uploaded successfully`
      });

      onUploadComplete?.(documentData.id);

      // Reset after delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadedFile(null);
        setUploadComplete(false);
        setUploadProgress(0);
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload document"
      });
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

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!isUploading && !uploadComplete ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a document'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to select a file
            </p>
            <p className="text-xs text-gray-400">
              Supports PDF, DOC, DOCX, XLS, XLSX files
            </p>
          </div>
        ) : isUploading ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <p className="text-lg font-medium mb-2">Uploading {uploadedFile?.name}</p>
            <Progress value={uploadProgress} className="w-full mb-2" />
            <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium mb-2">Upload Complete!</p>
            <p className="text-sm text-gray-500">{uploadedFile?.name} uploaded successfully</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
