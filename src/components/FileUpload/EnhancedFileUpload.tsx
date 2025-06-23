
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDeepSeekIntegration } from '@/hooks/useDeepSeekIntegration';

interface EnhancedFileUploadProps {
  onUploadComplete?: (documentId: string, analysis: any) => void;
  className?: string;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onUploadComplete,
  className
}) => {
  const {
    isUploading,
    uploadProgress,
    analysisResult,
    uploadWithDeepSeekAnalysis
  } = useDeepSeekIntegration();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const result = await uploadWithDeepSeekAnalysis(file);

    if (result.success && result.documentId) {
      onUploadComplete?.(result.documentId, analysisResult);
    }
  }, [uploadWithDeepSeekAnalysis, analysisResult, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff']
    },
    multiple: false,
    disabled: isUploading
  });

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Brain className="h-8 w-8 text-blue-600 animate-pulse mr-2" />
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">DeepSeek AI Processing...</p>
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-xs text-gray-500">
                  {uploadProgress < 30 ? 'Uploading file...' :
                   uploadProgress < 60 ? 'Running AI analysis...' :
                   uploadProgress < 90 ? 'Extracting data & assessing risks...' :
                   'Finalizing categorization...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your file here' : 'Upload Document for AI Analysis'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, Word, Excel, or Image files (BIA Forms 1-96 supported)
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  PDF, DOCX, XLSX
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  AI-Powered Analysis
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Auto-Categorization
                </span>
              </div>

              <Button 
                variant="outline" 
                className="mt-4"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>

        {analysisResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                DeepSeek Analysis Complete
              </span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <p>Form: {analysisResult.formIdentification?.formType}</p>
              <p>Confidence: {analysisResult.formIdentification?.confidence}%</p>
              <p>Risk Level: {analysisResult.riskAssessment?.overallRisk}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
