
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Bot, FileText, CheckCircle } from "lucide-react";
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
          description: `${selectedFiles.length} documents uploaded and organized automatically.`,
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
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Upload Client Documents
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Select documents to upload. Our AI will automatically organize them in the Documents page.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                onChange={handleFileSelect}
                disabled={uploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{selectedFiles.length} file(s) selected</span>
                </div>
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="text-xs text-gray-500 truncate">
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading documents...</span>
                  <span className="font-medium text-gray-900">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {aiProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-600 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">AI Processing</p>
                    <p className="text-xs text-blue-700">Analyzing and organizing documents...</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={uploading || selectedFiles.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
