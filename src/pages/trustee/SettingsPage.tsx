
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import SettingsPage from "@/pages/SettingsPage";

const TrusteeSettingsPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <SettingsPage />
      </div>
    </MainLayout>
  );
};

export default TrusteeSettingsPage;
