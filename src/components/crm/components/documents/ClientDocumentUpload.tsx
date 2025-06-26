
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Bot, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadDocumentToStorage } from "@/utils/documentUpload";
import { Progress } from "@/components/ui/progress";
import { DeepSeekAnalysisOrchestrator } from "@/services/DeepSeekAnalysisOrchestrator";

interface ClientDocumentUploadProps {
  clientId: string;
  clientName: string;
  onUploadComplete?: () => void;
}

export const ClientDocumentUpload = ({ clientId, clientName, onUploadComplete }: ClientDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select at least one file to upload."
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let completedFiles = 0;

      for (const file of selectedFiles) {
        // Upload document to storage
        const result = await uploadDocumentToStorage(file, {
          clientName,
          onProgress: (progress) => {
            const fileProgress = (completedFiles / totalFiles) * 100 + (progress / totalFiles);
            setUploadProgress(fileProgress);
          }
        });

        if (result.success && result.documentId) {
          // Start DeepSeek AI processing for document organization
          setAiProcessing(true);
          
          try {
            await DeepSeekAnalysisOrchestrator.processDocumentPipeline(
              file,
              'current-user-id', // This would come from auth context
              {
                clientHint: clientName,
                forceAnalysis: true
              }
            );
          } catch (aiError) {
            console.error('AI processing error:', aiError);
            // Don't fail the upload if AI processing fails
          }
        }

        completedFiles++;
      }

      setUploadProgress(100);
      
      setTimeout(() => {
        setAiProcessing(false);
        toast({
          title: "Upload Complete",
          description: `${selectedFiles.length} documents uploaded. DeepSeek AI is organizing them in the Documents page.`,
        });
        
        setSelectedFiles([]);
        onUploadComplete?.();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again."
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Client Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {selectedFiles.length} file(s) selected
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {aiProcessing && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Bot className="h-4 w-4 animate-pulse" />
              DeepSeek AI is analyzing and organizing documents...
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={uploading || selectedFiles.length === 0}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            DeepSeek AI Document Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Automatically extracts client names from documents</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Identifies document types (Forms, Financial, Legal, etc.)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Organizes documents into proper client folders</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Updates the main Documents page automatically</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
