
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeStringCast } from '@/utils/typeGuards';

export interface UserSettings {
  timeZone: string;
  setTimeZone: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  compactView: boolean;
  setCompactView: (value: boolean) => void;
  documentSync: boolean;
  setDocumentSync: (value: boolean) => void;
  defaultCurrency: string;
  setDefaultCurrency: (value: string) => void;
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (value: boolean) => void;
  sessionTimeout: string;
  setSessionTimeout: (value: string) => void;
  ipWhitelisting: boolean;
  setIpWhitelisting: (value: boolean) => void;
  loginNotifications: boolean;
  setLoginNotifications: (value: boolean) => void;
  documentEncryption: boolean;
  setDocumentEncryption: (value: boolean) => void;
  passwordExpiry: string;
  setPasswordExpiry: (value: string) => void;
}

export const useSettings = () => {
  const { toast } = useToast();
  
  // General Settings
  const [timeZone, setTimeZone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [documentSync, setDocumentSync] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState("CAD");
  
  // Security Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [documentEncryption, setDocumentEncryption] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState("90");
  
  const [isLoading, setIsLoading] = useState(true);

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
        setTimeZone(safeStringCast(data.time_zone) || "UTC");
        setLanguage(safeStringCast(data.language) || "en");
        setAutoSave(data.auto_save !== undefined ? Boolean(data.auto_save) : true);
        setCompactView(data.compact_view !== undefined ? Boolean(data.compact_view) : false);
        setDocumentSync(data.document_sync !== undefined ? Boolean(data.document_sync) : true);
        setDefaultCurrency(safeStringCast(data.default_currency) || "CAD");
        setTwoFactorEnabled(data.two_factor_enabled !== undefined ? Boolean(data.two_factor_enabled) : false);
        setSessionTimeout(safeStringCast(data.session_timeout) || "30");
        setIpWhitelisting(data.ip_whitelisting !== undefined ? Boolean(data.ip_whitelisting) : false);
        setLoginNotifications(data.login_notifications !== undefined ? Boolean(data.login_notifications) : true);
        setDocumentEncryption(data.document_encryption !== undefined ? Boolean(data.document_encryption) : true);
        setPasswordExpiry(safeStringCast(data.password_expiry) || "90");
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: "Using default settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const settingsData = {
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
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData);

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
    }
  };

  const userSettings: UserSettings = {
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
    setPasswordExpiry
  };

  return {
    settings: userSettings,
    saveSettings,
    isLoading
  };
};
