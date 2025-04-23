
import React from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ConnectionTest } from "@/components/DocumentViewer/DocumentPreview/components/ConnectionTest";
import { DiagnosticTool } from "@/components/DocumentViewer/DocumentPreview/components/DiagnosticTool";
import { SimplePDFViewer } from "@/components/PDFViewer/SimplePDFViewer";

const DiagnosticsPage: React.FC = () => {
  const sampleDocumentPath = "documents/sample-documents/form-47-consumer-proposal.pdf";
  
  return (
    <MainLayout>
      <div className="space-y-6 p-4">
        <h1 className="text-2xl font-bold">System Diagnostics</h1>
        <p className="text-muted-foreground">
          Use these tools to diagnose issues with document viewing and API connectivity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>API Connection Test</CardTitle>
              <CardDescription>
                Verify Supabase API keys and connection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionTest />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Document System Diagnostics</CardTitle>
              <CardDescription>
                Analyze document access and storage permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiagnosticTool storagePath={sampleDocumentPath} expanded={true} />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>PDF Viewer Test</CardTitle>
            <CardDescription>
              Test PDF viewing capabilities with Google Docs fallback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] border rounded-md">
              <SimplePDFViewer 
                storagePath={sampleDocumentPath}
                title="Sample Document"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DiagnosticsPage;
