
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PDFAnalysisTest } from '@/components/testing/PDFAnalysisTest';

const TestingPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">System Testing</h1>
          <p className="text-muted-foreground">
            Test PDF accessibility and DeepSeek AI integration
          </p>
        </div>
        
        <PDFAnalysisTest />
      </div>
    </MainLayout>
  );
};

export default TestingPage;
