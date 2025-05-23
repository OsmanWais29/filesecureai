
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeStringConvert, safeBooleanConvert } from '@/utils/typeGuards';

interface UserSettings {
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

export function useSettings() {
  const [timeZone, setTimeZone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [documentSync, setDocumentSync] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('CAD');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [documentEncryption, setDocumentEncryption] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState('90');
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setTimeZone(safeStringConvert(data.time_zone, 'UTC'));
        setLanguage(safeStringConvert(data.language, 'en'));
        setDefaultCurrency(safeStringConvert(data.default_currency, 'CAD'));
        setAutoSave(safeBooleanConvert(data.auto_save, true));
        setCompactView(safeBooleanConvert(data.compact_view, false));
        setDocumentSync(safeBooleanConvert(data.document_sync, true));
        setTwoFactorEnabled(safeBooleanConvert(data.two_factor_enabled, false));
        setSessionTimeout(safeStringConvert(data.session_timeout, '30'));
        setIpWhitelisting(safeBooleanConvert(data.ip_whitelisting, false));
        setLoginNotifications(safeBooleanConvert(data.login_notifications, true));
        setDocumentEncryption(safeBooleanConvert(data.document_encryption, true));
        setPasswordExpiry(safeStringConvert(data.password_expiry, '90'));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save settings.",
          variant: "destructive"
        });
        return;
      }

      const settingsData = {
        user_id: user.id,
        time_zone: timeZone,
        language: language,
        default_currency: defaultCurrency,
        auto_save: autoSave,
        compact_view: compactView,
        document_sync: documentSync,
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
        .upsert(settingsData, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "There was a problem updating your preferences.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    // General settings
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
    
    // Security settings
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
    
    // Actions
    saveSettings, // This function now exists and works!
    loading
  };
}
