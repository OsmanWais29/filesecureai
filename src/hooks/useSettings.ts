
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  timeZone: string;
  language: string;
  autoSave: boolean;
  compactView: boolean;
  documentSync: boolean;
  defaultCurrency: string;
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  ipWhitelisting: boolean;
  loginNotifications: boolean;
  documentEncryption: boolean;
  passwordExpiry: string;
}

const defaultSettings: Settings = {
  timeZone: 'UTC',
  language: 'en',
  autoSave: true,
  compactView: false,
  documentSync: true,
  defaultCurrency: 'CAD',
  twoFactorEnabled: false,
  sessionTimeout: '30',
  ipWhitelisting: false,
  loginNotifications: true,
  documentEncryption: true,
  passwordExpiry: '90'
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          timeZone: data.time_zone || defaultSettings.timeZone,
          language: data.language || defaultSettings.language,
          autoSave: data.auto_save ?? defaultSettings.autoSave,
          compactView: data.compact_view ?? defaultSettings.compactView,
          documentSync: data.document_sync ?? defaultSettings.documentSync,
          defaultCurrency: data.default_currency || defaultSettings.defaultCurrency,
          twoFactorEnabled: data.two_factor_enabled ?? defaultSettings.twoFactorEnabled,
          sessionTimeout: data.session_timeout || defaultSettings.sessionTimeout,
          ipWhitelisting: data.ip_whitelisting ?? defaultSettings.ipWhitelisting,
          loginNotifications: data.login_notifications ?? defaultSettings.loginNotifications,
          documentEncryption: data.document_encryption ?? defaultSettings.documentEncryption,
          passwordExpiry: data.password_expiry || defaultSettings.passwordExpiry
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: "Using default settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          time_zone: settings.timeZone,
          language: settings.language,
          auto_save: settings.autoSave,
          compact_view: settings.compactView,
          document_sync: settings.documentSync,
          default_currency: settings.defaultCurrency,
          two_factor_enabled: settings.twoFactorEnabled,
          session_timeout: settings.sessionTimeout,
          ip_whitelisting: settings.ipWhitelisting,
          login_notifications: settings.loginNotifications,
          document_encryption: settings.documentEncryption,
          password_expiry: settings.passwordExpiry,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    // Settings values
    timeZone: settings.timeZone,
    setTimeZone: (value: string) => setSettings(prev => ({ ...prev, timeZone: value })),
    language: settings.language,
    setLanguage: (value: string) => setSettings(prev => ({ ...prev, language: value })),
    autoSave: settings.autoSave,
    setAutoSave: (value: boolean) => setSettings(prev => ({ ...prev, autoSave: value })),
    compactView: settings.compactView,
    setCompactView: (value: boolean) => setSettings(prev => ({ ...prev, compactView: value })),
    documentSync: settings.documentSync,
    setDocumentSync: (value: boolean) => setSettings(prev => ({ ...prev, documentSync: value })),
    defaultCurrency: settings.defaultCurrency,
    setDefaultCurrency: (value: string) => setSettings(prev => ({ ...prev, defaultCurrency: value })),
    twoFactorEnabled: settings.twoFactorEnabled,
    setTwoFactorEnabled: (value: boolean) => setSettings(prev => ({ ...prev, twoFactorEnabled: value })),
    sessionTimeout: settings.sessionTimeout,
    setSessionTimeout: (value: string) => setSettings(prev => ({ ...prev, sessionTimeout: value })),
    ipWhitelisting: settings.ipWhitelisting,
    setIpWhitelisting: (value: boolean) => setSettings(prev => ({ ...prev, ipWhitelisting: value })),
    loginNotifications: settings.loginNotifications,
    setLoginNotifications: (value: boolean) => setSettings(prev => ({ ...prev, loginNotifications: value })),
    documentEncryption: settings.documentEncryption,
    setDocumentEncryption: (value: boolean) => setSettings(prev => ({ ...prev, documentEncryption: value })),
    passwordExpiry: settings.passwordExpiry,
    setPasswordExpiry: (value: string) => setSettings(prev => ({ ...prev, passwordExpiry: value })),
    
    // Methods
    save,
    loading,
    saving
  };
}
