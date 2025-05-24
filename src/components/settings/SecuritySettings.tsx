
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Clock, Globe, Bell, Key } from 'lucide-react';
import { toast } from 'sonner';

interface SecuritySettingsProps {
  settings: {
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
  };
  onSave: () => void;
  isLoading: boolean;
}

export const SecuritySettings = ({ settings, onSave, isLoading }: SecuritySettingsProps) => {
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);

  const handleTwoFactorToggle = (enabled: boolean) => {
    settings.setTwoFactorEnabled(enabled);
    if (enabled) {
      console.log('2FA enabled - would trigger setup flow');
      toast.info('Two-factor authentication setup would be initiated here');
    }
  };

  return (
    <div className="space-y-6">
      {/* Authentication Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Manage your login security and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={settings.twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="login-notifications">Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              id="login-notifications"
              checked={settings.loginNotifications}
              onCheckedChange={settings.setLoginNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Control how long you stay logged in and password policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <Select value={settings.sessionTimeout} onValueChange={settings.setSessionTimeout}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeout duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              You'll be automatically logged out after this period of inactivity
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password-expiry">Password Expiry</Label>
            <Select value={settings.passwordExpiry} onValueChange={settings.setPasswordExpiry}>
              <SelectTrigger>
                <SelectValue placeholder="Select expiry period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              You'll be required to change your password after this period
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Document Security
          </CardTitle>
          <CardDescription>
            Protect your documents with encryption and secure storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="document-encryption">Document Encryption</Label>
              <p className="text-sm text-muted-foreground">
                Encrypt all uploaded documents for maximum security
              </p>
            </div>
            <Switch
              id="document-encryption"
              checked={settings.documentEncryption}
              onCheckedChange={settings.setDocumentEncryption}
            />
          </div>

          {settings.documentEncryption && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>Encryption Active:</strong> All your documents are encrypted with AES-256 
                encryption at rest and in transit. Supabase provides enterprise-grade security 
                for all stored data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Manage who can access your account and from where
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-whitelisting">IP Address Restrictions</Label>
              <p className="text-sm text-muted-foreground">
                Only allow access from specific IP addresses
              </p>
            </div>
            <Switch
              id="ip-whitelisting"
              checked={settings.ipWhitelisting}
              onCheckedChange={settings.setIpWhitelisting}
            />
          </div>

          {settings.ipWhitelisting && (
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                <strong>IP Restrictions Active:</strong> Contact your administrator to manage 
                allowed IP addresses. This feature enhances security for sensitive environments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={onSave} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Saving...' : 'Save Security Settings'}
      </Button>
    </div>
  );
};
