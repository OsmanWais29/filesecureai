
import React, { useState, useCallback } from "react";
import { Upload, UploadCloud, X, File, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onRemoveFile: () => void;
  uploadedFile: File | null;
  uploadProgress: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileUpload, 
  onRemoveFile, 
  uploadedFile,
  uploadProgress 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragging 
              ? "border-accent bg-accent/5 shadow-lg" 
              : "border-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-all"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className={`rounded-full p-6 ${isDragging ? 'bg-accent/20' : 'bg-primary/10'}`}>
              <UploadCloud className={`h-12 w-12 ${isDragging ? 'text-accent' : 'text-primary/80'}`} />
            </div>
            
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-semibold">Upload your PDF</h3>
              <p className="text-muted-foreground">
                Drag and drop your PDF file here, or click the button below to select a file from your computer
              </p>
            </div>
            
            <div className="flex gap-4">
              <label htmlFor="file-upload" className="w-full">
                <Button 
                  className="w-full cursor-pointer" 
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select PDF
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Maximum file size: 10MB. Supported format: PDF
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-background shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <File className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <h4 className="text-lg font-medium">{uploadedFile.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveFile}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {uploadProgress < 100 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : (
            <div className="flex items-center text-sm text-green-600">
              <div className="rounded-full bg-green-100 p-1 mr-2">
                <FileCheck className="h-4 w-4" />
              </div>
              File uploaded successfully and ready for processing
            </div>
          )}
        </div>
      )}
    </div>
  );
};
