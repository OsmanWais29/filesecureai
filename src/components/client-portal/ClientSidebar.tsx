
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Calendar, 
  MessageCircle,
  Settings,
  User
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const ClientSidebar = () => {
  const location = useLocation();
  const { user } = useAuthState();
  
  // Get client name from user metadata or fallback to email
  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Client";
  const clientInitials = clientName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    {
      path: "/client-portal",
      label: "Dashboard",
      icon: Home
    },
    {
      path: "/client-portal/documents",
      label: "Documents",
      icon: FileText
    },
    {
      path: "/client-portal/tasks",
      label: "Tasks",
      icon: CheckSquare
    },
    {
      path: "/client-portal/appointments",
      label: "Appointments",
      icon: Calendar
    },
    {
      path: "/client-portal/support",
      label: "Support",
      icon: MessageCircle
    },
    {
      path: "/client-portal/settings",
      label: "Settings",
      icon: Settings
    }
  ];

  return (
    <aside className="h-full bg-white dark:bg-background border-r flex flex-col">
      <div className="px-4 py-6 border-b">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {clientInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{clientName}</h3>
            <p className="text-xs text-muted-foreground">Client Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1 py-2">
          {navItems.map((item) => {
            const isActive = 
              (item.path === "/client-portal" && location.pathname === "/client-portal") || 
              (item.path !== "/client-portal" && location.pathname.startsWith(item.path));
              
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 font-normal",
                    isActive ? "bg-primary/10 text-primary" : ""
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Need assistance?</h4>
              <p className="text-xs text-muted-foreground">Contact your trustee</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
