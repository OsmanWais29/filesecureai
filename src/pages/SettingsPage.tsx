
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Settings panel coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
