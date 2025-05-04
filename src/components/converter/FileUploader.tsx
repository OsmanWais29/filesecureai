
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
    <div className="max-w-2xl mx-auto">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted hover:border-primary/50 hover:bg-primary/5 transition-all"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`rounded-full p-4 ${isDragging ? 'bg-primary/20' : 'bg-primary/10'}`}>
              <UploadCloud className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-primary/80'}`} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload PDF Document</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Drag and drop your PDF file here, or click the button below to select a file
              </p>
            </div>
            
            <div>
              <label htmlFor="file-upload">
                <Button 
                  className="cursor-pointer" 
                  variant="default"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select PDF File
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
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <File className="h-6 w-6 text-primary" />
              </div>
              
              <div>
                <h4 className="text-base font-medium">{uploadedFile.name}</h4>
                <p className="text-xs text-muted-foreground">
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
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploadProgress < 100 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Uploading file...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          ) : (
            <div className="flex items-center text-xs text-green-600">
              <FileCheck className="h-4 w-4 mr-1.5" />
              File uploaded successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
};
