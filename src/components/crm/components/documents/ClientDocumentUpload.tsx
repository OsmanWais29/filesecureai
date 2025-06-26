
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Bot, FileText, CheckCircle, CloudUpload } from "lucide-react";
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
    <div className="space-y-6">
      {/* Main Upload Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:border-blue-300 transition-all duration-300">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CloudUpload className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Upload Client Documents
          </CardTitle>
          <p className="text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
            Upload documents and our AI will automatically organize them by client and document type in the main Documents section.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Input Section */}
          <div className="relative">
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={handleFileSelect}
              disabled={uploading}
              className="h-14 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white hover:file:from-blue-600 hover:file:to-indigo-700 file:transition-all file:duration-200 file:shadow-md hover:file:shadow-lg cursor-pointer border-2 border-gray-200 hover:border-blue-300 transition-colors"
            />
          </div>

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedFiles.length} file(s) selected</p>
                  <p className="text-sm text-gray-500">Ready for upload and AI processing</p>
                </div>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Uploading documents...</span>
                </div>
                <span className="font-bold text-blue-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-3 bg-gray-100" />
            </div>
          )}

          {/* AI Processing Indicator */}
          {aiProcessing && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold text-purple-900">AI Processing Documents</p>
                  <p className="text-sm text-purple-700">Analyzing content and organizing by client...</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button 
            onClick={handleUpload} 
            disabled={uploading || selectedFiles.length === 0}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5" />
                <span>Upload & Organize Documents</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success State (when completed) */}
      {!uploading && !aiProcessing && selectedFiles.length === 0 && (
        <div className="text-center py-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600">Documents ready for upload</p>
        </div>
      )}
    </div>
  );
};
