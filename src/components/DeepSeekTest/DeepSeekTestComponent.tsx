
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { DeepSeekCoreService } from '@/services/DeepSeekCoreService';
import { DocumentProcessingPipelineService } from '@/services/DocumentProcessingPipeline';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TestResult {
  stage: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export const DeepSeekTestComponent: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [documentId, setDocumentId] = useState<string>('');

  const updateTestResult = (stage: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.stage === stage);
      if (existing) {
        return prev.map(r => r.stage === stage ? { stage, status, message, data } : r);
      }
      return [...prev, { stage, status, message, data }];
    });
  };

  const runDeepSeekTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Step 1: Check API Configuration
      updateTestResult('config', 'pending', 'Checking DeepSeek API configuration...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        updateTestResult('config', 'error', 'User not authenticated');
        return;
      }

      // Step 2: Create Test Document (Form 31 - Proof of Claim)
      updateTestResult('document', 'pending', 'Creating test Form 31 document...');
      
      const testDocumentContent = `
        FORM 31
        PROOF OF CLAIM
        
        Estate Number: 123456789
        Debtor Name: John Smith
        Creditor Name: ABC Corporation
        Claim Amount: $15,000.00
        
        This is to certify that the debtor is indebted to the creditor as of the date of bankruptcy.
        
        Date: December 1, 2024
        Signature: [Signature Present]
        
        Supporting documents attached: Yes
        Priority claim: No
        Secured claim: No
      `;

      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          title: 'Test Form 31 - Proof of Claim',
          type: 'application/pdf',
          size: testDocumentContent.length,
          user_id: user.id,
          ai_processing_status: 'pending',
          metadata: {
            content: testDocumentContent,
            test_document: true,
            form_type: 'Form 31',
            created_for_testing: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (docError || !document) {
        updateTestResult('document', 'error', `Failed to create test document: ${docError?.message}`);
        return;
      }

      setDocumentId(document.id);
      updateTestResult('document', 'success', `Test document created: ${document.id}`);

      // Step 3: Test DeepSeek Analysis
      updateTestResult('analysis', 'pending', 'Running DeepSeek AI analysis...');
      
      const analysisResult = await DeepSeekCoreService.analyzeDocument(document.id);
      
      if (!analysisResult) {
        updateTestResult('analysis', 'error', 'DeepSeek analysis returned null result');
        return;
      }

      updateTestResult('analysis', 'success', 'DeepSeek analysis completed successfully', {
        formType: analysisResult.formIdentification?.formType,
        confidence: analysisResult.formIdentification?.confidence,
        riskLevel: analysisResult.riskAssessment?.overallRisk,
        riskCount: analysisResult.riskAssessment?.riskFactors?.length || 0
      });

      // Step 4: Verify Database Storage
      updateTestResult('storage', 'pending', 'Verifying analysis storage in database...');
      
      const { data: storedAnalysis, error: storageError } = await supabase
        .from('document_analysis')
        .select('*')
        .eq('document_id', document.id)
        .single();

      if (storageError || !storedAnalysis) {
        updateTestResult('storage', 'error', `Analysis not stored in database: ${storageError?.message}`);
      } else {
        updateTestResult('storage', 'success', 'Analysis successfully stored in database', storedAnalysis);
      }

      // Step 5: Test Risk Assessment Storage
      updateTestResult('risks', 'pending', 'Checking risk assessment storage...');
      
      const { data: risks, error: riskError } = await supabase
        .from('osb_risk_assessments')
        .select('*')
        .eq('analysis_id', document.id);

      if (riskError) {
        updateTestResult('risks', 'error', `Risk assessment query failed: ${riskError.message}`);
      } else {
        updateTestResult('risks', 'success', `Found ${risks?.length || 0} risk assessments`, risks);
      }

      toast.success('DeepSeek integration test completed');

    } catch (error) {
      console.error('DeepSeek test failed:', error);
      updateTestResult('error', 'error', `Test failed: ${error.message}`);
      toast.error('DeepSeek integration test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const cleanupTestDocument = async () => {
    if (!documentId) return;
    
    try {
      await supabase.from('documents').delete().eq('id', documentId);
      toast.success('Test document cleaned up');
      setDocumentId('');
      setTestResults([]);
    } catch (error) {
      toast.error('Failed to cleanup test document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            DeepSeek Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will test the complete DeepSeek integration pipeline using a simulated Form 31 (Proof of Claim) document.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={runDeepSeekTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Run DeepSeek Test
                </>
              )}
            </Button>

            {documentId && (
              <Button 
                variant="outline" 
                onClick={cleanupTestDocument}
                disabled={isRunning}
              >
                Cleanup Test Data
              </Button>
            )}
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium capitalize">{result.stage}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    {result.data && (
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
