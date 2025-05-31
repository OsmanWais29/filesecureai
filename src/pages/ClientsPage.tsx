
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ClientsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Client management functionality coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClientsPage;
