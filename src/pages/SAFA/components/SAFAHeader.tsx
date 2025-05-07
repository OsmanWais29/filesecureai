
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCircle, Menu, Bell, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SAFAHeaderProps {
  toggleSidebar: () => void;
}

const SAFAHeader: React.FC<SAFAHeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">SecureFiles AI</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/avatars/01.png" alt="User avatar" />
          <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default SAFAHeader;
