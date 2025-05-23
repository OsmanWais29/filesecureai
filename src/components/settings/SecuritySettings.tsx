
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/hooks/useSettings";

interface SecuritySettingsProps {
  settings: UserSettings;
  onSave: () => void;
  isLoading: boolean;
}

export const SecuritySettings = ({ settings, onSave, isLoading }: SecuritySettingsProps) => {
  const handleTwoFactorToggle = (enabled: boolean) => {
    settings.setTwoFactorEnabled(enabled);
    if (enabled) {
      console.log('Two-factor authentication enabled');
    }
  };

  return (
    <div className="space-y-6">
      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
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
                Get notified of new login attempts
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
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <Select value={settings.sessionTimeout} onValueChange={settings.setSessionTimeout}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Document Security */}
      <Card>
        <CardHeader>
          <CardTitle>Document Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="document-encryption">Document Encryption</Label>
              <p className="text-sm text-muted-foreground">
                Encrypt sensitive documents for enhanced security
              </p>
            </div>
            <Switch
              id="document-encryption"
              checked={settings.documentEncryption}
              onCheckedChange={settings.setDocumentEncryption}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-whitelisting">IP Whitelisting</Label>
              <p className="text-sm text-muted-foreground">
                Restrict access to specific IP addresses
              </p>
            </div>
            <Switch
              id="ip-whitelisting"
              checked={settings.ipWhitelisting}
              onCheckedChange={settings.setIpWhitelisting}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={onSave} disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Security Settings"}
      </Button>
    </div>
  );
};
