
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DeepSeekTestComponent } from '@/components/DeepSeekTest/DeepSeekTestComponent';

const DeepSeekTestPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">DeepSeek Integration Test</h1>
        <DeepSeekTestComponent />
      </div>
    </MainLayout>
  );
};

export default DeepSeekTestPage;
