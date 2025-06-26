
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { Upload, FileText, AlertCircle } from 'lucide-react';

export const DocumentUploadStep = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Upload Supporting Documents</h4>
              <p className="text-sm text-blue-700">
                Please upload any relevant financial documents, statements, or forms that might help us understand your situation better.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Recommended Documents
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            <li>• Bank statements (last 3 months)</li>
            <li>• Pay stubs or income verification</li>
            <li>• Tax returns (last 2 years)</li>
            <li>• Debt statements or notices</li>
            <li>• Any court documents or legal notices</li>
          </ul>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <FileUpload onUploadComplete={(documentId) => {
            console.log('Document uploaded:', documentId);
          }} />
        </div>
        
        <p className="text-xs text-muted-foreground">
          All documents are encrypted and stored securely. Only authorized personnel will have access to your information.
        </p>
      </CardContent>
    </Card>
  );
};
