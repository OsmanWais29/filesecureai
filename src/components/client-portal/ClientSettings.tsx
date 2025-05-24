
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

interface ClientProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  preferred_contact: 'email' | 'phone' | 'both';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  language: string;
  timezone: string;
}

export const ClientSettings = () => {
  const { user } = useAuthState();
  const [profile, setProfile] = useState<ClientProfile>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    preferred_contact: 'email',
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    language: 'en',
    timezone: 'EST'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: String(data.full_name || ''),
          email: String(data.email || user?.email || ''),
          phone: String(data.phone || ''),
          address: String(data.address || ''),
          preferred_contact: (data.preferred_contact as 'email' | 'phone' | 'both') || 'email',
          notifications_enabled: Boolean(data.notifications_enabled ?? true),
          email_notifications: Boolean(data.email_notifications ?? true),
          sms_notifications: Boolean(data.sms_notifications ?? false),
          language: String(data.language || 'en'),
          timezone: String(data.timezone || 'EST')
        });
      } else {
        // Set defaults with user email
        setProfile(prev => ({
          ...prev,
          email: user?.email || ''
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

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          preferred_contact: profile.preferred_contact,
          notifications_enabled: profile.notifications_enabled,
          email_notifications: profile.email_notifications,
          sms_notifications: profile.sms_notifications,
          language: profile.language,
          timezone: profile.timezone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Profile updated successfully');
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
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted"></CardHeader>
              <CardContent className="h-40 bg-muted"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full mt-1 p-2 border rounded-md"
                value={profile.preferred_contact}
                onChange={(e) => setProfile({ ...profile, preferred_contact: e.target.value as any })}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="both">Both</option>
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
            Choose how you want to receive updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications_enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your case and appointments
              </p>
            </div>
            <Switch
              id="notifications_enabled"
              checked={profile.notifications_enabled}
              onCheckedChange={(checked) => 
                setProfile({ ...profile, notifications_enabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={profile.email_notifications}
              disabled={!profile.notifications_enabled}
              onCheckedChange={(checked) => 
                setProfile({ ...profile, email_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms_notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              id="sms_notifications"
              checked={profile.sms_notifications}
              disabled={!profile.notifications_enabled}
              onCheckedChange={(checked) => 
                setProfile({ ...profile, sms_notifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Preferences
          </CardTitle>
          <CardDescription>
            Set your language and timezone preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="w-full mt-1 p-2 border rounded-md"
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full mt-1 p-2 border rounded-md"
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
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

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Download My Data
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveProfile}
          disabled={saving}
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
