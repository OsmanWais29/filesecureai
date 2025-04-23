
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Plus, FileText, Bug } from "lucide-react";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  mobileOnly?: boolean;
}

const navigationItems: NavItem[] = [
  {
    title: 'Documents',
    href: '/documents',
    icon: <FileText className="h-5 w-5" />,
    mobileOnly: false
  },
  {
    title: 'New Document',
    href: '/documents/new',
    icon: <Plus className="h-5 w-5" />,
    mobileOnly: true
  },
  {
    title: 'Diagnostics',
    href: '/diagnostics',
    icon: <Bug className="h-5 w-5" />,
    mobileOnly: false
  },
];

export const Navbar: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = !!user && !loading;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-bold text-xl">
          BIA Docs
        </Link>

        <div className="flex items-center space-x-4">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className={`hidden md:flex items-center space-x-2 text-sm font-medium hover:underline ${item.mobileOnly ? 'hidden' : ''}`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}

          <ModeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
