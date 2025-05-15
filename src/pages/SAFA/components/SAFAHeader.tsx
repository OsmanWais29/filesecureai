
import React from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon, User, Settings, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SAFAHeaderProps {
  toggleSidebar: () => void;
}

const SAFAHeader: React.FC<SAFAHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  
  // Get initials from user's email for avatar fallback
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <MenuIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">SecureFiles AI Assistant</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => navigate('/profile')}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
};

export default SAFAHeader;
