
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

      if (data && data.settings && typeof data.settings === 'object') {
        const settings = data.settings as Record<string, any>;
        setTimeZone(safeStringCast(settings.timeZone) || "UTC");
        setLanguage(safeStringCast(settings.language) || "en");
        setAutoSave(settings.autoSave !== undefined ? Boolean(settings.autoSave) : true);
        setCompactView(settings.compactView !== undefined ? Boolean(settings.compactView) : false);
        setDocumentSync(settings.documentSync !== undefined ? Boolean(settings.documentSync) : true);
        setDefaultCurrency(safeStringCast(settings.defaultCurrency) || "CAD");
        setTwoFactorEnabled(settings.twoFactorEnabled !== undefined ? Boolean(settings.twoFactorEnabled) : false);
        setSessionTimeout(safeStringCast(settings.sessionTimeout) || "30");
        setIpWhitelisting(settings.ipWhitelisting !== undefined ? Boolean(settings.ipWhitelisting) : false);
        setLoginNotifications(settings.loginNotifications !== undefined ? Boolean(settings.loginNotifications) : true);
        setDocumentEncryption(settings.documentEncryption !== undefined ? Boolean(settings.documentEncryption) : true);
        setPasswordExpiry(safeStringCast(settings.passwordExpiry) || "90");
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

      const settings = {
        timeZone,
        language,
        autoSave,
        compactView,
        documentSync,
        defaultCurrency,
        twoFactorEnabled,
        sessionTimeout,
        ipWhitelisting,
        loginNotifications,
        documentEncryption,
        passwordExpiry
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings,
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
