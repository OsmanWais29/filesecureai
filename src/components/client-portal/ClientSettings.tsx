
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuthState } from "@/hooks/useAuthState";
import { Bell, ShieldCheck, User, Info } from "lucide-react";

export const ClientSettings = () => {
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // User profile state
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    address: user?.user_metadata?.address || "",
    preferredContact: user?.user_metadata?.preferred_contact || "email"
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    documentAlerts: true,
    appointmentReminders: true,
    taskUpdates: false,
    marketingEmails: false
  });
  
  // Handle profile save
  const handleProfileSave = async () => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would update the user profile in Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: "Please try again"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle notification settings save
  const handleNotificationSave = () => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would update the notification settings in Supabase
      setTimeout(() => {
        toast.success("Notification settings updated");
        setIsUpdating(false);
      }, 1000); // Simulate API call
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification settings");
      setIsUpdating(false);
    }
  };
  
  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large", {
        description: "Maximum size is 5MB"
      });
      return;
    }
    
    // Check file type
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload an image file (JPEG, PNG, GIF)"
      });
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    toast.success("Profile picture selected", {
      description: "Save your profile to apply changes"
    });
  };
  
  // Get user initials for avatar fallback
  const userInitials = formData.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || "CL";

  return (
    <div className="p-4 md:p-6 w-full">
      <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
      <p className="text-muted-foreground mb-6">
        Manage your account and preferences
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 pb-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                  >
                    Change
                  </label>
                  <input 
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{formData.fullName}</h3>
                  <p className="text-muted-foreground text-sm">{formData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">Client</Badge>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </div>
              
              {/* Personal Details Form */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Contact Method</Label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleInputChange}
                        className="text-primary"
                      />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleInputChange}
                        className="text-primary"
                      />
                      <span>Phone</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleProfileSave} 
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Document Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified when new documents are available</p>
                  </div>
                  <Switch
                    checked={notificationSettings.documentAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, documentAlerts: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Appointment Reminders</h4>
                    <p className="text-sm text-muted-foreground">Receive reminders about upcoming appointments</p>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, appointmentReminders: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Task Updates</h4>
                    <p className="text-sm text-muted-foreground">Get notified about task assignments and updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.taskUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, taskUpdates: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-muted-foreground">Receive newsletters and promotional content</p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleNotificationSave} 
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground mb-4">Update your password to keep your account secure</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <Button className="w-full sm:w-auto">
                      Update Password
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                  
                  <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">Two-factor authentication is currently unavailable for client accounts.</p>
                      <p className="text-sm text-muted-foreground mt-1">Please contact your trustee for more information.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Actions that can't be undone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">If you wish to delete your account, please contact your trustee directly.</p>
                <p className="text-sm text-muted-foreground">Account deletion must be coordinated with your bankruptcy or insolvency case.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
