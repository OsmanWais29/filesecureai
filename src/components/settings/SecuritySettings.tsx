
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Shield, Lock, AlertTriangle, Bell } from "lucide-react";

interface SecuritySettingsProps {
  settings?: any;
  onSave?: () => void;
  isLoading?: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ 
  settings, 
  onSave, 
  isLoading = false 
}) => {
  return (
    <div className="space-y-6">
      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Configure authentication and access control settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            <Switch 
              checked={settings?.twoFactorEnabled} 
              onCheckedChange={settings?.setTwoFactorEnabled}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select value={settings?.sessionTimeout} onValueChange={settings?.setSessionTimeout}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Password Expiry</Label>
            <Select value={settings?.passwordExpiry} onValueChange={settings?.setPasswordExpiry}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Manage access restrictions and security policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Whitelisting</Label>
              <CardDescription>
                Restrict access to specific IP addresses
              </CardDescription>
            </div>
            <Switch 
              checked={settings?.ipWhitelisting} 
              onCheckedChange={settings?.setIpWhitelisting}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Document Encryption</Label>
              <CardDescription>
                Encrypt all documents at rest
              </CardDescription>
            </div>
            <Switch 
              checked={settings?.documentEncryption} 
              onCheckedChange={settings?.setDocumentEncryption}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Security Notifications
          </CardTitle>
          <CardDescription>
            Configure security-related notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Notifications</Label>
              <CardDescription>
                Receive alerts for new login attempts
              </CardDescription>
            </div>
            <Switch 
              checked={settings?.loginNotifications} 
              onCheckedChange={settings?.setLoginNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
