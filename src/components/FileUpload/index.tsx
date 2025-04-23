
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadProps {
  onUploadComplete?: (documentId: string) => Promise<void> | void;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  maxSizeMB = 10,
  acceptedFileTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }
      
      try {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus("Preparing upload...");
        setError(null);
        
        // Get current user
        const { data: userData } = await supabase.auth.getSession();
        const user = userData?.session?.user;
        
        if (!user) {
          throw new Error("You must be logged in to upload files");
        }
        
        // Generate unique file name
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        setUploadProgress(10);
        setUploadStatus("Uploading file to secure storage...");
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }
        
        setUploadProgress(50);
        setUploadStatus("Creating document record...");
        
        // Create document record in database
        const { data: document, error: insertError } = await supabase
          .from("documents")
          .insert({
            title: file.name,
            type: file.type,
            size: file.size,
            storage_path: filePath,
            user_id: user.id,
            ai_processing_status: "pending",
            metadata: {
              original_filename: file.name,
              upload_date: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
        
        setUploadProgress(75);
        setUploadStatus("Triggering document analysis...");

        // Trigger document analysis with edge function
        const { error: analysisError } = await supabase.functions.invoke("process-document", {
          body: {
            documentId: document.id,
            storagePath: filePath,
          },
        });

        if (analysisError) {
          console.error("Analysis initialization error:", analysisError);
          // Don't throw here - we want to consider the upload successful even if analysis fails to start
        }

        setUploadProgress(100);
        setUploadStatus("Upload complete!");

        toast.success("Document uploaded successfully", {
          description: "Your document is being analyzed in the background.",
        });

        // Notify parent component
        if (onUploadComplete) {
          await onUploadComplete(document.id);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.message || "An error occurred during upload");
        toast.error("Upload failed", {
          description: err.message || "Please try again later",
        });
      } finally {
        // Reset state after a delay to show completion
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadStatus("");
        }, 3000);
      }
    },
    [maxSizeMB, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    noClick: true,
    disabled: isUploading,
  });

  const handleCancel = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus("");
    setError(null);
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700"}
          ${isUploading ? "pointer-events-none opacity-60" : "hover:border-primary"}
        `}
      >
        <input {...getInputProps()} />
        
        {!isUploading && !error && (
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop your file here or
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, Word, and Excel documents (max {maxSizeMB}MB)
              </p>
            </div>
            <Button type="button" onClick={open}>
              Select File
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="space-y-4">
            <div className="flex justify-between mb-1">
              <div className="text-sm">{uploadStatus}</div>
              <div className="text-sm">{uploadProgress}%</div>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {error && !isUploading && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="flex flex-col items-center space-y-2">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
