
import React from "react";
import { SettingsLayout } from "./SettingsLayout";
import { SettingsNavigation } from "./SettingsNavigation";
import { GeneralSettings } from "./GeneralSettings";
import { SecuritySettings } from "./SecuritySettings";
import { AccessControlDashboard } from "./access-control/AccessControlDashboard";
import { IntegrationsSettings } from "./IntegrationsSettings";
import { useState } from "react";

export const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState("general");

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "security":
        return <SecuritySettings />;
      case "access-control":
        return <AccessControlDashboard />;
      case "integrations":
        return <IntegrationsSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <SettingsLayout
      navigation={
        <SettingsNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      }
      title="Settings"
      description="Configure your application preferences and security settings"
    >
      {renderContent()}
    </SettingsLayout>
  );
};
