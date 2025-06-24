
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your application settings.</p>
        </div>
        <SettingsPanel />
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
