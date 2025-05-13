
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, signOut } = useAuthState();
  
  const handleSignOut = async () => {
    await signOut();
    toast.success('You have been signed out successfully');
  };

  // Get initials from user's email for avatar fallback
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="User avatar" />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-medium">{user?.user_metadata?.full_name || user?.email}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Role: {user?.user_metadata?.user_type || 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 pt-4">
              <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
