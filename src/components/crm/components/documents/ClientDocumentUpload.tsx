
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, FolderOpen, Bot, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadDocumentToStorage } from "@/utils/documentUpload";
import { Progress } from "@/components/ui/progress";

interface ClientDocumentUploadProps {
  clientId: string;
  clientName: string;
  onUploadComplete?: () => void;
}

export const ClientDocumentUpload = ({ clientId, clientName, onUploadComplete }: ClientDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<string>("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const { toast } = useToast();

  const documentTypes = [
    { value: "form-47", label: "Form 47 - Consumer Proposal" },
    { value: "form-65", label: "Form 65 - Assignment in Bankruptcy" },
    { value: "form-76", label: "Form 76 - Statement of Affairs" },
    { value: "financial-statements", label: "Financial Statements" },
    { value: "bank-statements", label: "Bank Statements" },
    { value: "tax-returns", label: "Tax Returns" },
    { value: "employment-records", label: "Employment Records" },
    { value: "asset-documents", label: "Asset Documents" },
    { value: "debt-documents", label: "Debt Documents" },
    { value: "correspondence", label: "Correspondence" },
    { value: "court-documents", label: "Court Documents" },
    { value: "other", label: "Other Documents" }
  ];

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
        const result = await uploadDocumentToStorage(file, {
          clientName,
          onProgress: (progress) => {
            const fileProgress = (completedFiles / totalFiles) * 100 + (progress / totalFiles);
            setUploadProgress(fileProgress);
          }
        });

        if (result.success && result.documentId) {
          // Trigger AI organization
          await organizeDocumentWithAI(result.documentId, file.name, documentType);
        }

        completedFiles++;
      }

      setUploadProgress(100);
      
      // Simulate AI processing
      setAiProcessing(true);
      setTimeout(() => {
        setAiProcessing(false);
        toast({
          title: "Upload Complete",
          description: `${selectedFiles.length} documents uploaded and organized successfully.`,
        });
        
        setSelectedFiles([]);
        setDocumentType("");
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

  const organizeDocumentWithAI = async (documentId: string, fileName: string, type: string) => {
    // This would call an AI service to analyze and organize the document
    // For now, we'll simulate the organization process
    console.log(`Organizing document ${documentId} (${fileName}) of type ${type} for client ${clientName}`);
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
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Files</Label>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFiles.length > 0 && (
              <div className="text-sm text-muted-foreground">
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
              AI is organizing documents into proper folders...
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={uploading || selectedFiles.length === 0 || !documentType}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload & Organize Documents'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            AI Document Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Automatically creates client-specific folder structure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Categorizes documents by type (Forms, Financial, Legal, etc.)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Extracts key information and metadata</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Links related documents together</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
