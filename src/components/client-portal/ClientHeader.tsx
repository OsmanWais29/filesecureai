
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
import { supabase } from "@/lib/supabase";

export const ClientHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/client-portal");
  };

  return (
    <div className="border-b bg-white dark:bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Left side - logo or title could go here */}
        <div className="flex-1"></div>
        
        {/* Right side - notifications and user dropdown */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <BellIcon className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>John Doe</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
