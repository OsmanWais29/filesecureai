
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { settings, saveSettings, isLoading } = useSettings();
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your general preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings 
                settings={{
                  timeZone: settings.timeZone,
                  setTimeZone: settings.setTimeZone,
                  language: settings.language,
                  setLanguage: settings.setLanguage,
                  autoSave: settings.autoSave,
                  setAutoSave: settings.setAutoSave,
                  compactView: settings.compactView,
                  setCompactView: settings.setCompactView,
                  documentSync: settings.documentSync,
                  setDocumentSync: settings.setDocumentSync,
                  defaultCurrency: settings.defaultCurrency,
                  setDefaultCurrency: settings.setDefaultCurrency,
                }}
                onSave={handleSaveGeneral}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure your security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettings 
                settings={{
                  twoFactorEnabled: settings.twoFactorEnabled,
                  setTwoFactorEnabled: settings.setTwoFactorEnabled,
                  sessionTimeout: settings.sessionTimeout,
                  setSessionTimeout: settings.setSessionTimeout,
                  ipWhitelisting: settings.ipWhitelisting,
                  setIpWhitelisting: settings.setIpWhitelisting,
                  loginNotifications: settings.loginNotifications,
                  setLoginNotifications: settings.setLoginNotifications,
                  documentEncryption: settings.documentEncryption,
                  setDocumentEncryption: settings.setDocumentEncryption,
                  passwordExpiry: settings.passwordExpiry,
                  setPasswordExpiry: settings.setPasswordExpiry,
                }}
                onSave={handleSaveSecurity}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Manage your third-party integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Integration settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
