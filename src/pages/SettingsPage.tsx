
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { AccessControlSettings } from "@/components/settings/AccessControlSettings";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Shield, Users, Database } from "lucide-react";

const SettingsPage = () => {
  const { settings, saveSettings } = useSettings();
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="access-control" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="access-control" className="space-y-6">
          <AccessControlSettings />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
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
      </Tabs>
    </div>
  );
};

export default SettingsPage;
