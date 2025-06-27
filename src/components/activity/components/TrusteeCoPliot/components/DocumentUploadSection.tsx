
import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  verificationStatus: 'pending' | 'verified' | 'flagged';
  confidence: number;
}

interface DocumentUploadSectionProps {
  onDocumentUpload?: (document: UploadedDocument) => void;
}

export const DocumentUploadSection = ({ onDocumentUpload }: DocumentUploadSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);

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

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate verification results
      const mockVerification: UploadedDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('spreadsheet') || file.name.includes('.xlsx') ? 'spreadsheet' : 'document',
        size: file.size,
        verificationStatus: Math.random() > 0.3 ? 'verified' : 'flagged',
        confidence: Math.round(Math.random() * 30 + 70)
      };

      setUploadProgress(100);
      setUploadedDocs(prev => [...prev, mockVerification]);
      onDocumentUpload?.(mockVerification);

      toast.success(`Document ${mockVerification.verificationStatus === 'verified' ? 'verified' : 'flagged for review'}`);
      
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onDocumentUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false,
    disabled: uploading
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'flagged':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, confidence: number) => {
    const variant = status === 'verified' ? 'default' : status === 'flagged' ? 'destructive' : 'secondary';
    return (
      <Badge variant={variant} className="text-xs">
        {status === 'verified' ? 'Verified' : status === 'flagged' ? 'Flagged' : 'Pending'} ({confidence}%)
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upload Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-3">
                <FileSpreadsheet className="h-8 w-8 mx-auto text-primary animate-pulse" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Processing document...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress < 30 ? 'Uploading...' :
                     uploadProgress < 60 ? 'Analyzing content...' :
                     uploadProgress < 90 ? 'Verifying against income data...' :
                     'Finalizing verification...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop document here' : 'Upload bank statements, spreadsheets, or receipts'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Excel, Word, or image files
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={uploading}>
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {uploadedDocs.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Uploaded Documents</h4>
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.verificationStatus)}
                    <div>
                      <p className="text-xs font-medium truncate max-w-32">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(doc.verificationStatus, doc.confidence)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
