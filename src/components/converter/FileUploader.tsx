
import React, { useState, useCallback } from "react";
import { Upload, UploadCloud, X, File } from "lucide-react";
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
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <UploadCloud className="h-12 w-12 text-muted-foreground/80" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload your PDF document</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to select your PDF file
              </p>
            </div>
            <div className="max-w-xs w-full">
              <label htmlFor="file-upload" className="w-full">
                <Button className="w-full cursor-pointer" onClick={() => {}}>
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
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-md">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{uploadedFile.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
          
          {uploadProgress < 100 ? (
            <>
              <Progress value={uploadProgress} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground text-right">
                Uploading: {uploadProgress}%
              </p>
            </>
          ) : (
            <div className="flex items-center text-sm text-green-600">
              <span className="rounded-full bg-green-100 p-1 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Upload complete
            </div>
          )}
        </div>
      )}
    </div>
  );
};
