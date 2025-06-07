
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthState } from '@/hooks/useAuthState';
import { supabase } from '@/lib/supabase';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { AccessControlDashboard } from '@/components/settings/access-control/AccessControlDashboard';
import { EncryptionStatus } from '@/components/security/EncryptionStatus';
import { AuditTrail } from '@/components/audit/AuditTrail';
import { Settings as SettingsIcon, Shield, Database, Activity } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  
  // General Settings State
  const [timeZone, setTimeZone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [documentSync, setDocumentSync] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('CAD');

  // Security Settings State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [documentEncryption, setDocumentEncryption] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState('90');

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setTimeZone(String(data.time_zone || 'UTC'));
        setLanguage(String(data.language || 'en'));
        setAutoSave(Boolean(data.auto_save ?? true));
        setCompactView(Boolean(data.compact_view ?? false));
        setDocumentSync(Boolean(data.document_sync ?? true));
        setDefaultCurrency(String(data.default_currency || 'CAD'));
        setTwoFactorEnabled(Boolean(data.two_factor_enabled ?? false));
        setSessionTimeout(String(data.session_timeout || '30'));
        setIpWhitelisting(Boolean(data.ip_whitelisting ?? false));
        setLoginNotifications(Boolean(data.login_notifications ?? true));
        setDocumentEncryption(Boolean(data.document_encryption ?? true));
        setPasswordExpiry(String(data.password_expiry || '90'));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          time_zone: timeZone,
          language,
          auto_save: autoSave,
          compact_view: compactView,
          document_sync: documentSync,
          default_currency: defaultCurrency,
          two_factor_enabled: twoFactorEnabled,
          session_timeout: sessionTimeout,
          ip_whitelisting: ipWhitelisting,
          login_notifications: loginNotifications,
          document_encryption: documentEncryption,
          password_expiry: passwordExpiry,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Log the settings update
      await supabase.from('audit_logs').insert({
        action: 'settings_update',
        user_id: user.id,
        metadata: { 
          updated_fields: ['general_settings', 'security_settings'],
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const generalSettings = {
    timeZone,
    setTimeZone,
    language,
    setLanguage,
    autoSave,
    setAutoSave,
    compactView,
    setCompactView,
    documentSync,
    setDocumentSync,
    defaultCurrency,
    setDefaultCurrency,
    // Include security settings to match UserSettings interface
    twoFactorEnabled,
    setTwoFactorEnabled,
    sessionTimeout,
    setSessionTimeout,
    ipWhitelisting,
    setIpWhitelisting,
    loginNotifications,
    setLoginNotifications,
    documentEncryption,
    setDocumentEncryption,
    passwordExpiry,
    setPasswordExpiry,
  };

  const securitySettings = {
    twoFactorEnabled,
    setTwoFactorEnabled,
    sessionTimeout,
    setSessionTimeout,
    ipWhitelisting,
    setIpWhitelisting,
    loginNotifications,
    setLoginNotifications,
    documentEncryption,
    setDocumentEncryption,
    passwordExpiry,
    setPasswordExpiry,
    // Include general settings to match UserSettings interface  
    timeZone,
    setTimeZone,
    language,
    setLanguage,
    autoSave,
    setAutoSave,
    compactView,
    setCompactView,
    documentSync,
    setDocumentSync,
    defaultCurrency,
    setDefaultCurrency,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
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
            <Database className="h-4 w-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your application preferences and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings 
                settings={generalSettings}
                onSave={saveSettings}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security options and authentication preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettings 
                settings={securitySettings}
                onSave={saveSettings}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-control">
          <AccessControlDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
