
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ClientPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Client Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Client Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Client management features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientPage;
