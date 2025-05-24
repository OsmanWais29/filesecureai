
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Save, User, Bell, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

interface ClientProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  occupation: string;
  income: number;
  preferred_contact: string;
  language: string;
  timezone: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
}

export const ClientSettings = () => {
  const { user } = useAuthState();
  const [profile, setProfile] = useState<Partial<ClientProfile>>({});
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || user.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          date_of_birth: profileData.date_of_birth || '',
          emergency_contact_name: profileData.emergency_contact_name || '',
          emergency_contact_phone: profileData.emergency_contact_phone || '',
          occupation: profileData.occupation || '',
          income: profileData.income || 0,
          preferred_contact: profileData.preferred_contact || 'email',
          language: profileData.language || 'en',
          timezone: profileData.timezone || 'EST'
        });

        setNotifications({
          email_notifications: profileData.email_notifications ?? true,
          sms_notifications: profileData.sms_notifications ?? false
        });
      } else {
        // Create default profile if none exists
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: '',
          address: '',
          date_of_birth: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          occupation: '',
          income: 0,
          preferred_contact: 'email',
          language: 'en',
          timezone: 'EST'
        });
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching client data:', err);
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          ...notifications,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      toast.success('Settings saved successfully');
      setError(null);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof ClientProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="h-20 bg-muted rounded"></CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Settings</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchClientData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => updateProfile('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => updateProfile('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => updateProfile('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth || ''}
                  onChange={(e) => updateProfile('date_of_birth', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profile.address || ''}
                onChange={(e) => updateProfile('address', e.target.value)}
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={profile.occupation || ''}
                  onChange={(e) => updateProfile('occupation', e.target.value)}
                  placeholder="Enter your occupation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Annual Income</Label>
                <Input
                  id="income"
                  type="number"
                  value={profile.income || ''}
                  onChange={(e) => updateProfile('income', parseFloat(e.target.value) || 0)}
                  placeholder="Enter your annual income"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>
              Person to contact in case of emergency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={profile.emergency_contact_name || ''}
                  onChange={(e) => updateProfile('emergency_contact_name', e.target.value)}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={profile.emergency_contact_phone || ''}
                  onChange={(e) => updateProfile('emergency_contact_phone', e.target.value)}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
            <CardDescription>
              Choose how you'd like to receive updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
              <Select 
                value={profile.preferred_contact || 'email'} 
                onValueChange={(value) => updateProfile('preferred_contact', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and reminders via email
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email_notifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms_notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive urgent updates via text message
                  </p>
                </div>
                <Switch
                  id="sms_notifications"
                  checked={notifications.sms_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, sms_notifications: checked }))
                  }
                />
              </div>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={profile.language || 'en'} 
                  onValueChange={(value) => updateProfile('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
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
                  value={profile.timezone || 'EST'} 
                  onValueChange={(value) => updateProfile('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                    <SelectItem value="CST">Central Time (CST)</SelectItem>
                    <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                    <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
