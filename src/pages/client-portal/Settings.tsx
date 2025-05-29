
import { useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, Bell, Globe } from "lucide-react";
import { toast } from "sonner";

export const ClientSettings = () => {
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  
  // Profile settings
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
    preferredContact: user?.user_metadata?.preferred_contact || 'email'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    documentUpdates: true,
    taskDeadlines: true
  });

  // Regional settings
  const [regional, setRegional] = useState({
    timeZone: 'America/Toronto',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: 'CAD'
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegional = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Regional settings updated");
    } catch (error) {
      toast.error("Failed to update regional settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-600">
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  className="mt-1 border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="preferredContact" className="text-gray-700">Preferred Contact Method</Label>
                <Select value={profile.preferredContact} onValueChange={(value) => setProfile({...profile, preferredContact: value})}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-gray-700">Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choose how you want to be notified about updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Receive updates via text message</p>
                </div>
                <Switch
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Appointment Reminders</Label>
                  <p className="text-sm text-gray-600">Get reminded about upcoming appointments</p>
                </div>
                <Switch
                  checked={notifications.appointmentReminders}
                  onCheckedChange={(checked) => setNotifications({...notifications, appointmentReminders: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Document Updates</Label>
                  <p className="text-sm text-gray-600">Get notified when documents are updated</p>
                </div>
                <Switch
                  checked={notifications.documentUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, documentUpdates: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-700">Task Deadlines</Label>
                  <p className="text-sm text-gray-600">Receive reminders for task due dates</p>
                </div>
                <Switch
                  checked={notifications.taskDeadlines}
                  onCheckedChange={(checked) => setNotifications({...notifications, taskDeadlines: checked})}
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveNotifications}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Globe className="h-5 w-5" />
              Regional Preferences
            </CardTitle>
            <CardDescription className="text-gray-600">
              Set your time zone, language, and regional formatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Time Zone</Label>
                <Select value={regional.timeZone} onValueChange={(value) => setRegional({...regional, timeZone: value})}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                    <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                    <SelectItem value="America/Winnipeg">Central Time (Winnipeg)</SelectItem>
                    <SelectItem value="America/Halifax">Atlantic Time (Halifax)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Language</Label>
                <Select value={regional.language} onValueChange={(value) => setRegional({...regional, language: value})}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Date Format</Label>
                <Select value={regional.dateFormat} onValueChange={(value) => setRegional({...regional, dateFormat: value})}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Currency</Label>
                <Select value={regional.currency} onValueChange={(value) => setRegional({...regional, currency: value})}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleSaveRegional}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save Regional Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSettings;
