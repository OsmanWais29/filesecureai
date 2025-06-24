
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConversionResultsProps {
  result: {
    success: boolean;
    outputFormat: string;
    extractedData: {
      title: string;
      pages: number;
      tables: number;
      sections: number;
    };
    content: string;
  };
}

export const ConversionResults: React.FC<ConversionResultsProps> = ({ result }) => {
  const handleDownload = () => {
    const blob = new Blob([result.content], { 
      type: result.outputFormat === 'xml' ? 'application/xml' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-document.${result.outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded successfully!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    toast.success('Content copied to clipboard!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Conversion Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{result.extractedData.pages}</div>
            <div className="text-sm text-muted-foreground">Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{result.extractedData.tables}</div>
            <div className="text-sm text-muted-foreground">Tables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{result.extractedData.sections}</div>
            <div className="text-sm text-muted-foreground">Sections</div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-sm">
              {result.outputFormat.toUpperCase()}
            </Badge>
            <div className="text-sm text-muted-foreground">Format</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Generated Content</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-40">
              {result.content}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
