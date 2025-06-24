
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe,
  Key,
  Mail,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export const SettingsPanel = () => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Smith',
      email: 'john.smith@trustee.com',
      role: 'Licensed Insolvency Trustee',
      phone: '(555) 123-4567',
      license: 'LIT-2024-001'
    },
    notifications: {
      emailNotifications: true,
      taskReminders: true,
      documentAlerts: true,
      riskAlerts: true,
      weeklyReports: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordExpiry: '90'
    },
    system: {
      language: 'en',
      timezone: 'America/Toronto',
      dateFormat: 'MM/DD/YYYY',
      autoSave: true
    }
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const handleNotificationToggle = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          System
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Appearance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.profile.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.profile.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="license"
                    value={settings.profile.license}
                    onChange={(e) => handleProfileUpdate('license', e.target.value)}
                  />
                  <Badge variant="secondary">Verified</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Professional Role</Label>
              <Input
                id="role"
                value={settings.profile.role}
                onChange={(e) => handleProfileUpdate('role', e.target.value)}
              />
            </div>

            <Button onClick={() => handleSave('Profile')} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(value) => handleNotificationToggle('emailNotifications', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="task-reminders">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminders for pending tasks</p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={settings.notifications.taskReminders}
                  onCheckedChange={(value) => handleNotificationToggle('taskReminders', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="document-alerts">Document Processing Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alerts when documents are processed</p>
                </div>
                <Switch
                  id="document-alerts"
                  checked={settings.notifications.documentAlerts}
                  onCheckedChange={(value) => handleNotificationToggle('documentAlerts', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="risk-alerts">Risk Assessment Alerts</Label>
                  <p className="text-sm text-muted-foreground">Critical risk notifications</p>
                </div>
                <Switch
                  id="risk-alerts"
                  checked={settings.notifications.riskAlerts}
                  onCheckedChange={(value) => handleNotificationToggle('riskAlerts', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Weekly summary reports</p>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(value) => handleNotificationToggle('weeklyReports', value)}
                />
              </div>
            </div>

            <Button onClick={() => handleSave('Notification')} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(value) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorAuth: value }
                  }))}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Select
                    value={settings.security.sessionTimeout}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <Select
                    value={settings.security.passwordExpiry}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, passwordExpiry: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>

            <Button onClick={() => handleSave('Security')} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.system.language}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, language: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.system.timezone}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, timezone: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Toronto">Eastern Time</SelectItem>
                    <SelectItem value="America/Winnipeg">Central Time</SelectItem>
                    <SelectItem value="America/Edmonton">Mountain Time</SelectItem>
                    <SelectItem value="America/Vancouver">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={settings.system.dateFormat}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, dateFormat: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.system.autoSave}
                  onCheckedChange={(value) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, autoSave: value }
                  }))}
                />
              </div>
            </div>

            <Button onClick={() => handleSave('System')} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save System Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme or sync with system settings
                </p>
              </div>
            </div>

            <Button onClick={() => handleSave('Appearance')} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Appearance
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
