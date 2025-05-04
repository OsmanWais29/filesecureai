
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  BadgeCheck, 
  Edit, 
  Lock, 
  Mail, 
  Phone, 
  Save, 
  Shield, 
  User, 
  MapPin,
  Calendar, 
  CheckCircle
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ClientProfilePage = () => {
  const { user, signOut } = useAuthState();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "John Smith",
    email: user?.email || "",
    phone: "(555) 123-4567",
    address: "123 Main St, Apt 4B",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M5V 2N4",
    dateOfBirth: "1985-06-15",
    emergencyContact: "Jane Smith (Wife) - (555) 987-6543"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, you would send this to your backend and update the state accordingly
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account details and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Mail className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      {formData.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{formData.fullName}</CardTitle>
                <CardDescription>Client #31-5432100</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formData.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formData.city}, {formData.province}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>DOB: {new Date(formData.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
            
            {/* Profile Edit Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  {isEditing ? (
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Input 
                        id="province" 
                        value={formData.province}
                        onChange={(e) => handleInputChange('province', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input 
                        id="emergencyContact" 
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)} 
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Password</h4>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                    <p className="text-muted-foreground text-sm">Last changed 3 months ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Email Verification</h4>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{formData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Phone Verification</h4>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{formData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>
                  Recent access to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">Chrome on Windows</p>
                      </div>
                      <Badge variant="outline">Active Now</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Toronto, Canada</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Safari on iPhone</p>
                        <p className="text-xs text-muted-foreground">May 10, 2025 at 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Chrome on Windows</p>
                        <p className="text-xs text-muted-foreground">May 5, 2025 at 10:15 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Safari on iPhone</p>
                        <p className="text-xs text-muted-foreground">May 1, 2025 at 7:45 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">View All Login Activity</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Communication Channels</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Email Notifications</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 h-5 w-5 mr-1" />
                        <span className="text-sm text-muted-foreground">Enabled</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>Text Messages (SMS)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 h-5 w-5 mr-1" />
                        <span className="text-sm text-muted-foreground">Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Notification Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Document Updates</p>
                        <p className="text-sm text-muted-foreground">When new documents are available or require your attention</p>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 h-5 w-5 mr-1" />
                        <span className="text-sm text-muted-foreground">On</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Appointment Reminders</p>
                        <p className="text-sm text-muted-foreground">Notifications about upcoming meetings</p>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 h-5 w-5 mr-1" />
                        <span className="text-sm text-muted-foreground">On</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Task Deadlines</p>
                        <p className="text-sm text-muted-foreground">Alerts about upcoming and overdue tasks</p>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 h-5 w-5 mr-1" />
                        <span className="text-sm text-muted-foreground">On</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Status Updates</p>
                        <p className="text-sm text-muted-foreground">When your estate status changes</p>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 h-5 w-5 mr-1" />
                        <span className="text-sm text-muted-foreground">On</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Update Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProfilePage;
