
import { Button } from "@/components/ui/button";
import { 
  BellIcon, 
  LogOut, 
  User,
  Sun,
  Moon
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ClientHeaderProps {
  onSignOut?: () => Promise<void>;
}

export const ClientHeader = ({ onSignOut }: ClientHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { theme, setTheme } = useTheme();
  
  // Get client name from user metadata or fallback to email
  const clientName = user?.user_metadata?.full_name || user?.email || "Client";
  const clientInitials = clientName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();
    } else {
      navigate("/client-portal");
    }
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-background shadow-sm w-full flex-shrink-0 sticky top-0 z-20">
      <div className="flex h-full items-center px-4 md:px-6">
        {/* Left side - client portal title */}
        <div className="flex items-center">
          <img
            src="/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png"
            alt="SecureFiles AI"
            className="h-8 mr-3"
          />
          <h1 className="text-lg font-semibold">Client Portal</h1>
        </div>
        
        {/* Right side - notifications and user dropdown */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="icon" className="relative">
            <BellIcon className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
              2
            </Badge>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {clientInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{clientName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate("/client-portal/settings")}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
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
