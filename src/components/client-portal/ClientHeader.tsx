
import { Button } from "@/components/ui/button";
import { 
  BellIcon, 
  LogOut, 
  User 
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

interface ClientHeaderProps {
  onSignOut?: () => Promise<void>;
}

export const ClientHeader = ({ onSignOut }: ClientHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  
  // Get client name from user metadata or fallback to email
  const clientName = user?.user_metadata?.full_name || user?.email || "Client";

  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();
    } else {
      navigate("/client-portal");
    }
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-background shadow-sm w-full flex-shrink-0">
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
          <Button variant="outline" size="icon" className="relative">
            <BellIcon className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{clientName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
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
