
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { ProcessingOptions } from './ProcessingOptions';
import { ConversionResults } from './ConversionResults';
import { FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';

export interface ProcessingOptions {
  useOcr: boolean;
  extractTables: boolean;
  detectSections: boolean;
  dateFormat: string;
  outputFormat: "xml" | "json";
  confidence: number;
}

export const DocumentConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);
  const [options, setOptions] = useState<ProcessingOptions>({
    useOcr: true,
    extractTables: true,
    detectSections: true,
    dateFormat: 'YYYY-MM-DD',
    outputFormat: 'xml',
    confidence: 0.8
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setConversionResult(null);
  };

  const handleOptionsChange = (newOptions: Partial<ProcessingOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  const handleStartProcessing = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock conversion result
      const mockResult = {
        success: true,
        outputFormat: options.outputFormat,
        extractedData: {
          title: selectedFile.name,
          pages: 5,
          tables: options.extractTables ? 2 : 0,
          sections: options.detectSections ? 8 : 0
        },
        content: options.outputFormat === 'xml' 
          ? `<?xml version="1.0"?>\n<document>\n  <title>${selectedFile.name}</title>\n  <pages>5</pages>\n</document>`
          : `{"title": "${selectedFile.name}", "pages": 5, "confidence": ${options.confidence}}`
      };

      setConversionResult(mockResult);
      toast.success('Document converted successfully!');
    } catch (error) {
      toast.error('Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchProcessing = () => {
    toast.info('Batch processing feature coming soon');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload onUploadComplete={(docId) => console.log('Uploaded:', docId)} />
        </CardContent>
      </Card>

      <ProcessingOptions
        options={options}
        onChange={handleOptionsChange}
        onStartProcessing={handleStartProcessing}
        onBatchProcessing={handleBatchProcessing}
        isProcessing={isProcessing}
        file={selectedFile}
      />

      {conversionResult && (
        <ConversionResults result={conversionResult} />
      )}
    </div>
  );
};
