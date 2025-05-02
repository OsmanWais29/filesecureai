
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/useAuthState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, HelpCircle, FileText } from "lucide-react";

export const ClientHeader = () => {
  const { user, signOut } = useAuthState();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fullName = user?.user_metadata?.full_name || "Client";
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await signOut();
    navigate("/client-portal");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-background shadow-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <img
            src="/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png"
            alt="SecureFiles AI"
            className="h-8"
          />
          <div className="bg-blue-800 text-white text-xs px-2 py-1 rounded font-semibold">
            CLIENT PORTAL
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-1"
              onClick={() => {}}
            >
              <FileText className="h-4 w-4" />
              <span>My Documents</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-1"
              onClick={() => {}}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Support</span>
            </Button>
          </nav>

          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={fullName} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-white">
                    {initials || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
