
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Check, 
  Download, 
  LogOut, 
  Moon, 
  Save, 
  Settings, 
  Sun, 
  Trash, 
  UserCog, 
  X 
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const ClientSettingsPage = () => {
  const { user, signOut } = useAuthState();
  const navigate = useNavigate();
  
  // User preferences state
  const [theme, setTheme] = useState<"light" | "system" | "dark">("system");
  const [autoSave, setAutoSave] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(true);
  const [documentSync, setDocumentSync] = useState(true);
  const [language, setLanguage] = useState("english");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  
  const handleLogout = async () => {
    await signOut();
    navigate("/client-portal");
  };

  const handleSavePreferences = () => {
    // In a real app, you would send this to your backend and update the state accordingly
    console.log("Saving preferences:", {
      theme,
      autoSave,
      emailUpdates,
      smsUpdates,
      documentSync,
      language,
      dateFormat
    });
    
    // Show success message
  };

  const handleDownloadData = () => {
    // In a real app, you would trigger a data export process here
    console.log("Downloading user data");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your portal experience and manage your account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Display Preferences */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>
              Customize how the portal looks and behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`flex flex-col items-center gap-2 p-4 border rounded-md cursor-pointer transition ${
                    theme === "light" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-6 w-6" />
                  <span>Light</span>
                  {theme === "light" && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div
                  className={`flex flex-col items-center gap-2 p-4 border rounded-md cursor-pointer transition ${
                    theme === "dark" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-6 w-6" />
                  <span>Dark</span>
                  {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div
                  className={`flex flex-col items-center gap-2 p-4 border rounded-md cursor-pointer transition ${
                    theme === "system" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setTheme("system")}
                >
                  <Settings className="h-6 w-6" />
                  <span>System</span>
                  {theme === "system" && <Check className="h-4 w-4 text-primary" />}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Language & Format</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Application Behavior</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save" className="font-normal">Auto-save documents</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your documents as you edit them
                    </p>
                  </div>
                  <Switch 
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={setAutoSave} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="document-sync" className="font-normal">Sync documents across devices</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep your documents synced between all your devices
                    </p>
                  </div>
                  <Switch 
                    id="document-sync"
                    checked={documentSync}
                    onCheckedChange={setDocumentSync} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSavePreferences}>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* Account & Notification Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-updates" className="font-normal">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch 
                  id="email-updates"
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-updates" className="font-normal">SMS notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via text message
                  </p>
                </div>
                <Switch 
                  id="sms-updates"
                  checked={smsUpdates}
                  onCheckedChange={setSmsUpdates} 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>
                Control your account data and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleDownloadData}>
                <Download className="mr-2 h-4 w-4" />
                Download My Data
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              
              <Separator className="my-2" />
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
          
          <Alert>
            <UserCog className="h-4 w-4" />
            <AlertTitle>Need more help?</AlertTitle>
            <AlertDescription>
              Contact your trustee for additional account settings or assistance with your account.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ClientSettingsPage;
