
export interface UserSettings {
  timeZone: string;
  language: string;
  defaultCurrency: string;
  autoSave: boolean;
  compactView: boolean;
  documentSync: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  ipWhitelisting: boolean;
  loginNotifications: boolean;
  documentEncryption: boolean;
  passwordExpiry: string;
}

// Add missing user settings table structure to match the database
export interface UserSettingsRow {
  user_id: string;
  time_zone: string;
  language: string;
  default_currency: string;
  auto_save: boolean;
  compact_view: boolean;
  document_sync: boolean;
  two_factor_enabled: boolean;
  session_timeout: string;
  ip_whitelisting: boolean;
  login_notifications: boolean;
  document_encryption: boolean;
  password_expiry: string;
  created_at: string;
  updated_at: string;
}
