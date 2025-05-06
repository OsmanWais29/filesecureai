
import React, { useState } from "react";
import { Search, LogOut, Menu, User, Bell, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "../notifications/NotificationBell";
import { NotificationsList } from "../notifications/NotificationsList";
import { supabase } from "@/lib/supabase";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export const MainHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again."
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-background px-4 sm:px-6 shadow-sm backdrop-blur-sm dark:bg-opacity-80">
      <div className="w-full flex items-center justify-between">
        {/* Search button that expands on tablet */}
        {isTablet && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-primary/10"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
        
        {/* Search input - full width on desktop, conditional on tablet */}
        <div className={`relative ${isMobile ? (showSearch ? 'w-full' : 'hidden') : 'w-full max-w-md'}`}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents, clients, or forms..."
            className="w-full pl-8 bg-white dark:bg-background border-gray-200 dark:border-gray-800 focus-visible:ring-primary/40"
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "rounded-full h-9 w-9 transition-all duration-300", 
              isDark ? "bg-primary/10 text-primary" : "text-orange-400"
            )}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Sun className={cn("h-5 w-5 transition-transform", isDark ? "rotate-0" : "rotate-90")} />
          </Button>

          {/* Notifications */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-full p-0 h-9 w-9 hover:bg-primary/10 transition-colors"
              >
                <NotificationBell />
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 max-h-[500px] overflow-hidden border-primary/20 shadow-lg">
              <NotificationsList 
                notifications={notifications} 
                isLoading={isLoadingNotifications} 
              />
            </PopoverContent>
          </Popover>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer h-9 w-9 bg-primary/10 hover:ring-2 hover:ring-primary/30 transition-all">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">JD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-primary/20 shadow-lg">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate('/profile')} 
                className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')} 
                className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="text-destructive cursor-pointer hover:bg-destructive/5 focus:bg-destructive/5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
