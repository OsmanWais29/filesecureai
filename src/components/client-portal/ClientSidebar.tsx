
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Home, FileCheck, Calendar, MessageCircle, HelpCircle, User, Settings } from "lucide-react";

export const ClientSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      path: "/client-portal"
    },
    { 
      icon: FileText, 
      label: "My Documents", 
      path: "/client-portal/documents"
    },
    { 
      icon: FileCheck, 
      label: "Tasks & Requirements", 
      path: "/client-portal/tasks"
    },
    { 
      icon: Calendar, 
      label: "Appointments", 
      path: "/client-portal/appointments" 
    },
    { 
      icon: MessageCircle, 
      label: "Messages", 
      path: "/client-portal/messages" 
    },
    { 
      icon: HelpCircle, 
      label: "Support", 
      path: "/client-portal/support" 
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/client-portal/profile" 
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/client-portal/settings" 
    }
  ];

  return (
    <div className="w-64 h-full flex flex-col border-r bg-background">
      {/* Logo area */}
      <div className="p-4 border-b flex items-center gap-2">
        <img
          src="/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png"
          alt="SecureFiles AI"
          className="h-8"
        />
        <div className="bg-blue-800 text-white text-xs px-2 py-1 rounded font-semibold">
          CLIENT PORTAL
        </div>
      </div>
      
      {/* Navigation items */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 px-3 py-6 h-auto",
                isActive(item.path) 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      
      {/* Status indicator */}
      <div className="p-4 border-t">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium">Current Status</p>
          </div>
          <p className="text-xs text-muted-foreground">Active - Proposal Approved</p>
        </div>
      </div>
    </div>
  );
};
