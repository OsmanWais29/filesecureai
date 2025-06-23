
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WorkflowPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Workflow Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Workflow features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowPage;
