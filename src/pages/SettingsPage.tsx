
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { AccessControlSettings } from "@/components/settings/AccessControlSettings";
import { SettingsNavigation } from "@/components/settings/SettingsNavigation";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { toast } from "sonner";

const SettingsPage = () => {
  const { settings, saveSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      await saveSettings();
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save general settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      await saveSettings();
      toast.success("Security settings saved successfully");
    } catch (error) {
      toast.error("Failed to save security settings");
    } finally {
      setLoading(false);
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your general preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings 
                settings={settings}
                onSave={handleSaveGeneral}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        );
      
      case "security":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure your security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettings 
                settings={settings}
                onSave={handleSaveSecurity}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        );
      
      case "access-control":
        return <AccessControlSettings />;
      
      case "integrations":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Manage your third-party integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Integration settings will be available soon.</p>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  const getTabTitle = () => {
    const item = [
      { id: "general", title: "General Settings" },
      { id: "security", title: "Security Settings" },
      { id: "access-control", title: "Access Control" },
      { id: "integrations", title: "Integrations" }
    ].find(item => item.id === activeTab);
    
    return item?.title || "Settings";
  };

  const getTabDescription = () => {
    const descriptions = {
      "general": "Configure your basic application preferences and regional settings",
      "security": "Manage authentication, encryption, and security preferences",
      "access-control": "Control user permissions, roles, and access rights",
      "integrations": "Connect and manage third-party service integrations"
    };
    
    return descriptions[activeTab as keyof typeof descriptions] || "Manage your account settings and preferences";
  };

  return (
    <SettingsLayout
      navigation={
        <SettingsNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      }
      title={getTabTitle()}
      description={getTabDescription()}
    >
      {getTabContent()}
    </SettingsLayout>
  );
};

export default SettingsPage;
