import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserSettings } from '@/types/settings';
import { toast } from 'sonner';

// Type guard to safely convert unknown to string
const safeStringConvert = (value: unknown, defaultValue: string): string => {
  return typeof value === 'string' ? value : defaultValue;
};

// Type guard to safely convert unknown to boolean
const safeBooleanConvert = (value: unknown, defaultValue: boolean): boolean => {
  return typeof value === 'boolean' ? value : defaultValue;
};

export const useSettings = () => {
  const [timeZone, setTimeZone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [defaultCurrency, setDefaultCurrency] = useState('CAD');
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [documentSync, setDocumentSync] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [documentEncryption, setDocumentEncryption] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState('90');

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

      if (data?.settings) {
        const settings = data.settings as Record<string, unknown>;
        setTimeZone(safeStringConvert(settings.timeZone, 'UTC'));
        setLanguage(safeStringConvert(settings.language, 'en'));
        setDefaultCurrency(safeStringConvert(settings.defaultCurrency, 'CAD'));
        setAutoSave(safeBooleanConvert(settings.autoSave, true));
        setCompactView(safeBooleanConvert(settings.compactView, false));
        setDocumentSync(safeBooleanConvert(settings.documentSync, true));
        setTwoFactorEnabled(safeBooleanConvert(settings.twoFactorEnabled, false));
        setSessionTimeout(safeStringConvert(settings.sessionTimeout, '30'));
        setIpWhitelisting(safeBooleanConvert(settings.ipWhitelisting, false));
        setLoginNotifications(safeBooleanConvert(settings.loginNotifications, true));
        setDocumentEncryption(safeBooleanConvert(settings.documentEncryption, true));
        setPasswordExpiry(safeStringConvert(settings.passwordExpiry, '90'));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const save = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const settings: UserSettings = {
        timeZone,
        language,
        defaultCurrency,
        autoSave,
        compactView,
        documentSync,
        twoFactorEnabled,
        sessionTimeout,
        ipWhitelisting,
        loginNotifications,
        documentEncryption,
        passwordExpiry,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, settings }, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  return {
    timeZone,
    setTimeZone,
    language,
    setLanguage,
    defaultCurrency,
    setDefaultCurrency,
    autoSave,
    setAutoSave,
    compactView,
    setCompactView,
    documentSync,
    setDocumentSync,
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
    save,
  };
};
