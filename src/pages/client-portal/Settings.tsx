
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Save } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  preferred_contact: string;
  language: string;
  timezone: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  document_updates: boolean;
  task_notifications: boolean;
}

export const ClientSettings = () => {
  const { user } = useAuthState();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    preferred_contact: 'email',
    language: 'en',
    timezone: 'EST'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    document_updates: true,
    task_notifications: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
        return;
      }

      if (data) {
        setProfile({
          full_name: String(data.full_name || ''),
          email: String(data.email || user.email || ''),
          phone: String(data.phone || ''),
          address: String(data.address || ''),
          preferred_contact: String(data.preferred_contact || 'email'),
          language: String(data.language || 'en'),
          timezone: String(data.timezone || 'EST')
        });

        setNotifications({
          email_notifications: Boolean(data.email_notifications ?? true),
          sms_notifications: Boolean(data.sms_notifications ?? false),
          appointment_reminders: true,
          document_updates: true,
          task_notifications: true
        });
      } else {
        // Set defaults with user email
        setProfile(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_id: user.id,
          ...profile,
          ...notifications,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save profile');
        return;
      }

      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
              <select
                id="preferred_contact"
                value={profile.preferred_contact}
                onChange={(e) => setProfile({ ...profile, preferred_contact: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Enter your address"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="EST">Eastern Time (EST)</option>
                <option value="CST">Central Time (CST)</option>
                <option value="MST">Mountain Time (MST)</option>
                <option value="PST">Pacific Time (PST)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive general updates via email
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={notifications.email_notifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, email_notifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms_notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive urgent updates via SMS
              </p>
            </div>
            <Switch
              id="sms_notifications"
              checked={notifications.sms_notifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, sms_notifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointment_reminders">Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming appointments
              </p>
            </div>
            <Switch
              id="appointment_reminders"
              checked={notifications.appointment_reminders}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, appointment_reminders: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="document_updates">Document Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when documents are updated
              </p>
            </div>
            <Switch
              id="document_updates"
              checked={notifications.document_updates}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, document_updates: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task_notifications">Task Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Alerts when new tasks are assigned
              </p>
            </div>
            <Switch
              id="task_notifications"
              checked={notifications.task_notifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, task_notifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password</Label>
            <p className="text-sm text-muted-foreground">
              To change your password, please contact your trustee or use the forgot password option on the login page.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Account Security</Label>
            <p className="text-sm text-muted-foreground">
              Your account is protected with industry-standard encryption and security measures.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveProfile} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default ClientSettings;
