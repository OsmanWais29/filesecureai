
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversionResult } from './types';
import { Download, FileText, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface ConversionResultsProps {
  result: ConversionResult;
  onDownload: () => void;
}

export const ConversionResults: React.FC<ConversionResultsProps> = ({ result, onDownload }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conversion Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Success
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Failed
                </>
              )}
            </Badge>
            <Button onClick={onDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download {result.outputFormat.toUpperCase()}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metadata" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="raw">Raw Output</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metadata" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">File Information</div>
                <div className="space-y-1 text-sm">
                  <div>Filename: {result.extractedData.metadata.filename}</div>
                  <div>Pages: {result.extractedData.metadata.pageCount}</div>
                  <div>Processing Time: {result.extractedData.metadata.processingTime}ms</div>
                  <div>Format: {result.outputFormat.toUpperCase()}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Extraction Summary</div>
                <div className="space-y-1 text-sm">
                  <div>Sections Found: {result.extractedData.sections.length}</div>
                  <div>Total Fields: {result.extractedData.sections.reduce((acc, section) => acc + section.fields.length, 0)}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              {result.extractedData.sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium mb-2">{section.name}</div>
                  <div className="space-y-2">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{field.name}:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{field.value}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(field.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="validation" className="space-y-4">
            <div className="space-y-4">
              {result.validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Validation Errors
                  </div>
                  <ul className="space-y-1">
                    {result.validationErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-600">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.validationWarnings.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Validation Warnings
                  </div>
                  <ul className="space-y-1">
                    {result.validationWarnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-600">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.validationErrors.length === 0 && result.validationWarnings.length === 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    No validation issues found
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-auto max-h-96">
                <code>{result.content}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
