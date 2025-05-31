
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, TestTube } from 'lucide-react';
import { OSBAnalysisService } from '@/services/OSBAnalysisService';
import { toast } from 'sonner';

interface TestResult {
  pdfAccessible: boolean;
  extractionSuccess: boolean;
  analysisSuccess: boolean;
  error?: string;
}

export const PDFAnalysisTest: React.FC = () => {
  const [documentId, setDocumentId] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    if (!documentId.trim()) {
      toast.error('Please enter a document ID');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await OSBAnalysisService.testPDFAnalysis(documentId.trim());
      setTestResult(result);
      
      if (result.analysisSuccess) {
        toast.success('PDF analysis test completed successfully!');
      } else {
        toast.warning('PDF analysis test completed with issues');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTestResult({
        pdfAccessible: false,
        extractionSuccess: false,
        analysisSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? 'default' : 'destructive'}>
        {success ? 'Pass' : 'Fail'}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          PDF Analysis Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Document ID to Test</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter document ID"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={runTest} disabled={testing}>
              {testing ? 'Testing...' : 'Run Test'}
            </Button>
          </div>
        </div>

        {testResult && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResult.pdfAccessible)}
                  <span className="font-medium">PDF Accessibility</span>
                </div>
                {getStatusBadge(testResult.pdfAccessible)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResult.extractionSuccess)}
                  <span className="font-medium">Text Extraction</span>
                </div>
                {getStatusBadge(testResult.extractionSuccess)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResult.analysisSuccess)}
                  <span className="font-medium">DeepSeek Analysis</span>
                </div>
                {getStatusBadge(testResult.analysisSuccess)}
              </div>
            </div>

            {testResult.error && (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-700">Error Details</span>
                </div>
                <p className="text-sm text-red-600">{testResult.error}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p><strong>Next Steps:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {!testResult.pdfAccessible && <li>Check document storage path and permissions</li>}
                {!testResult.extractionSuccess && <li>Verify PDF text extraction capabilities</li>}
                {!testResult.analysisSuccess && <li>Check DeepSeek API configuration and connectivity</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
