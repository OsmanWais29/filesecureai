
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  CheckCircle,
  Code,
  FileCode,
  Zap
} from 'lucide-react';

const ConverterPage = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResults, setConversionResults] = useState([]);

  const handleFileUpload = async (documentId: string) => {
    setIsConverting(true);
    
    // Simulate conversion process
    setTimeout(() => {
      const newResult = {
        id: documentId,
        originalName: 'bankruptcy_form_47.pdf',
        xmlName: 'bankruptcy_form_47_structured.xml',
        status: 'completed',
        timestamp: new Date().toISOString(),
        extractedFields: 42,
        confidenceScore: 96
      };
      
      setConversionResults(prev => [newResult, ...prev]);
      setIsConverting(false);
    }, 3000);
  };

  const features = [
    {
      title: "OCR Technology",
      description: "Advanced optical character recognition for scanned documents",
      icon: FileText
    },
    {
      title: "Structured Data",
      description: "Convert to XML with properly tagged fields and metadata",
      icon: Code
    },
    {
      title: "High Accuracy", 
      description: "AI-powered extraction with 95%+ accuracy rates",
      icon: CheckCircle
    },
    {
      title: "Batch Processing",
      description: "Process multiple documents simultaneously",
      icon: Zap
    }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
              <FileCode className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PDF to XML Converter</h1>
              <p className="text-gray-600">Advanced document conversion with AI-powered data extraction</p>
            </div>
          </div>
        </div>

        {/* Document Upload Section - Moved to top */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FileUpload 
                onUploadComplete={handleFileUpload}
              />
              
              {isConverting && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <h3 className="font-medium">Converting Document...</h3>
                  <p className="text-sm text-gray-600">Processing with AI-powered OCR</p>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Supported Formats</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">PDF</Badge>
                  <Badge variant="secondary">PNG</Badge>
                  <Badge variant="secondary">JPG</Badge>
                  <Badge variant="secondary">TIFF</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversion Results */}
        {conversionResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Conversion Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{result.originalName}</h3>
                        <p className="text-sm text-gray-600">Converted to: {result.xmlName}</p>
                      </div>
                      <Badge 
                        className={
                          result.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {result.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Fields Extracted:</span>
                        <p className="font-medium">{result.extractedFields}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <p className="font-medium">{result.confidenceScore}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <p className="font-medium">{new Date(result.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download XML
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ConverterPage;
