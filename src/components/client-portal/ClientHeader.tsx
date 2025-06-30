
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
import { Bell, LogOut, Settings, User, Menu, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientHeaderProps {
  onSignOut?: () => Promise<void>;
}

export const ClientHeader = ({ onSignOut }: ClientHeaderProps) => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (onSignOut) {
      setSigningOut(true);
      try {
        await onSignOut();
      } finally {
        setSigningOut(false);
      }
    }
  };

  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Client";
  const initials = clientName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 shadow-sm">
      {/* Left side - Logo and mobile menu */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!isMobile && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">SecureFiles AI</h1>
              <p className="text-xs text-blue-600 font-medium -mt-1">Client Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl"
        >
          <Bell className="h-5 w-5" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-blue-50">
              <Avatar className="h-10 w-10 border-2 border-blue-200">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={clientName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mr-4 mt-2 bg-white border border-blue-100 shadow-xl rounded-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold leading-none text-gray-900">{clientName}</p>
                <p className="text-xs leading-none text-gray-500">
                  {user?.email}
                </p>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                  Client Account
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-blue-100" />
            <DropdownMenuItem 
              onClick={() => navigate('/client-portal/settings')}
              className="hover:bg-blue-50 text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              <User className="mr-3 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/client-portal/settings')}
              className="hover:bg-blue-50 text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              <Settings className="mr-3 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-blue-100" />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              disabled={signingOut}
              className="hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
