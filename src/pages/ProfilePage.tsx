
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Loader2, User, Shield, Bell, CreditCard, Link } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { usePreferences } from "@/hooks/use-preferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedPersonalInfo } from "@/components/profile/sections/EnhancedPersonalInfo";
import { SecurityForm } from "@/components/profile/SecurityForm";
import { NotificationPreferences } from "@/components/profile/sections/NotificationPreferences";
import { BillingSection } from "@/components/profile/sections/BillingSection";
import { ConnectedAccounts } from "@/components/profile/sections/ConnectedAccounts";
import { AccountSection } from "@/components/profile/sections/AccountSection";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [passwordFields, setPasswordFields] = useState<PasswordUpdate>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    profile,
    setProfile,
    isLoadingProfile,
    debouncedProfile,
    updateProfile,
    isUpdatingProfile
  } = useProfile();

  const {
    preferences,
    isLoadingPreferences,
    handlePreferencesUpdate
  } = usePreferences();

  // Only update when debounced profile changes and we're not already updating
  useEffect(() => {
    if (debouncedProfile && profile && !isUpdatingProfile && JSON.stringify(debouncedProfile) !== JSON.stringify(profile)) {
      updateProfile.mutate(debouncedProfile);
    }
  }, [debouncedProfile, profile, isUpdatingProfile]);

  const handlePasswordUpdate = async () => {
    setIsUpdatingPassword(true);
    // Simulating password update
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordFields({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }, 1500);
  };

  const isLoading = isLoadingProfile || isLoadingPreferences;

  return (
    <MainLayout>
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            <ProfileHeader name={profile?.full_name || "User"} role="manager" />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="sticky top-0 z-10 bg-background py-4 border-b">
                <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-2">
                  <TabsTrigger value="personal" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Personal Info</span>
                    <span className="md:hidden">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Account</span>
                    <span className="md:hidden">Account</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden md:inline">Security</span>
                    <span className="md:hidden">Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden md:inline">Notifications</span>
                    <span className="md:hidden">Notif.</span>
                  </TabsTrigger>
                  <TabsTrigger value="connections" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span className="hidden md:inline">Connections</span>
                    <span className="md:hidden">Connect</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="personal" className="space-y-6 mt-6">
                <EnhancedPersonalInfo />
              </TabsContent>

              <TabsContent value="account" className="space-y-6 mt-6">
                <AccountSection />
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-6">
                <SecurityForm
                  onPasswordUpdate={handlePasswordUpdate}
                  passwordFields={passwordFields}
                  setPasswordFields={setPasswordFields}
                  isUpdatingPassword={isUpdatingPassword}
                />
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6 mt-6">
                <NotificationPreferences />
              </TabsContent>

              <TabsContent value="connections" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ConnectedAccounts />
                  <BillingSection />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </MainLayout>
  );
};

// Add default export
export default ProfilePage;
