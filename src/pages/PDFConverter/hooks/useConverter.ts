
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ExtractedField {
  name: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  editable: boolean;
  aiSuggestion?: string;
}

interface ProcessingStatus {
  stage: string;
  progress: number;
  message: string;
}

export const useConverter = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setExtractedFields([]);

    try {
      // Simulate processing stages
      const stages = [
        { stage: "OCR Processing", progress: 25, message: "Extracting text from PDF..." },
        { stage: "Form Detection", progress: 50, message: "Identifying document type..." },
        { stage: "Field Mapping", progress: 75, message: "Mapping fields to schema..." },
        { stage: "AI Analysis", progress: 100, message: "Finalizing extraction..." }
      ];

      for (const stage of stages) {
        setProcessingStatus(stage);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Mock extracted fields based on detected form type
      const mockFields: ExtractedField[] = [
        {
          name: "Debtor Name",
          value: "John Doe",
          confidence: 'high',
          editable: true
        },
        {
          name: "Line 15000 (Total Income)",
          value: "$2,465.00",
          confidence: 'high',
          editable: true,
          aiSuggestion: "Consider verifying against T4 slip"
        },
        {
          name: "Rent Expense",
          value: "$1,200.00",
          confidence: 'medium',
          editable: true
        },
        {
          name: "Surplus Income",
          value: "",
          confidence: 'low',
          editable: true,
          aiSuggestion: "Calculated field - should be auto-filled"
        },
        {
          name: "Trustee Signature",
          value: "",
          confidence: 'low',
          editable: false,
          aiSuggestion: "Digital signature required"
        }
      ];

      setExtractedFields(mockFields);
      toast.success(`Successfully extracted ${mockFields.length} fields from ${file.name}`);
    } catch (error) {
      toast.error("Error processing PDF");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  }, []);

  const handleFieldUpdate = useCallback((fieldName: string, value: string) => {
    setExtractedFields(prev => 
      prev.map(field => 
        field.name === fieldName 
          ? { ...field, value, confidence: 'high' as const }
          : field
      )
    );
  }, []);

  const handleReprocess = useCallback(() => {
    if (uploadedFile) {
      toast.info("Reprocessing document...");
      handleFileUpload(uploadedFile);
    }
  }, [uploadedFile, handleFileUpload]);

  const handleExport = useCallback((format: 'xml' | 'json' | 'csv') => {
    if (!uploadedFile || extractedFields.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create export data
    const exportData = extractedFields.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {} as Record<string, string>);

    let content = '';
    let mimeType = '';
    let extension = '';

    switch (format) {
      case 'xml':
        content = `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <metadata>
    <filename>${uploadedFile.name}</filename>
    <exportDate>${new Date().toISOString()}</exportDate>
  </metadata>
  <fields>
${extractedFields.map(field => `    <${field.name.replace(/\s+/g, '_')}>${field.value}</${field.name.replace(/\s+/g, '_')}>`).join('\n')}
  </fields>
</document>`;
        mimeType = 'application/xml';
        extension = 'xml';
        break;
      case 'json':
        content = JSON.stringify({
          metadata: {
            filename: uploadedFile.name,
            exportDate: new Date().toISOString()
          },
          fields: exportData
        }, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        content = 'Field Name,Value,Confidence\n' + 
          extractedFields.map(field => `"${field.name}","${field.value}","${field.confidence}"`).join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
        break;
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadedFile.name.replace('.pdf', '')}_extracted.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported as ${format.toUpperCase()}`);
  }, [uploadedFile, extractedFields]);

  const handleTraining = useCallback((action: 'confirm' | 'reject') => {
    if (action === 'confirm') {
      toast.success("Field mappings confirmed and sent for LLM training");
      // Here you would send the training data to your backend
    } else {
      toast.info("Field mappings rejected - no training data sent");
    }
  }, []);

  return {
    uploadedFile,
    extractedFields,
    processingStatus,
    isProcessing,
    handleFileUpload,
    handleFieldUpdate,
    handleReprocess,
    handleExport,
    handleTraining
  };
};
