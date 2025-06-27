
import { useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ClientHeaderProps {
  onSignOut?: () => Promise<void>;
}

export const ClientHeader = ({ onSignOut }: ClientHeaderProps) => {
  const { user, signOut } = useAuthState();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    try {
      setSigningOut(true);
      console.log("Signing out client user");
      
      if (onSignOut) {
        await onSignOut();
      } else {
        await signOut();
        navigate('/client-login', { replace: true });
      }
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setSigningOut(false);
    }
  };

  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Client";
  const initials = clientName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-4 md:px-6">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">SF</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold">SecureFiles AI</h1>
          <p className="text-xs text-muted-foreground">Client Portal</p>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={clientName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{clientName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/client-portal/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/client-portal/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
