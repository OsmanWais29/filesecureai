
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SecureFiles AI Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2,847</p>
              <p className="text-sm text-muted-foreground">Total documents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">186</p>
              <p className="text-sm text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">94.2%</p>
              <p className="text-sm text-muted-foreground">Rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
