
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
  User,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const ClientSidebar = () => {
  const location = useLocation();
  const { user } = useAuthState();
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

  // Set CSS custom property for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--client-sidebar-width', 
      isCollapsed ? '4rem' : '16rem'
    );

    // Emit custom event for sidebar collapse
    const event = new CustomEvent('clientSidebarCollapse', { 
      detail: { collapsed: isCollapsed } 
    });
    window.dispatchEvent(event);

    // Small delay to allow transition to complete
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    return () => {
      clearTimeout(timer);
      document.documentElement.style.removeProperty('--client-sidebar-width');
    };
  }, [isCollapsed]);

  const handleAssistanceRequest = async () => {
    if (!user) return;
    
    if (!helpMessage.trim()) {
      toast.error("Please provide details about your request");
      return;
    }
    
    setIsSubmittingRequest(true);
    
    try {
      // Create a notification in the system for staff
      const { error } = await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'supportRequest',
          userId: 'admin', // This would target the admin or trustee in a real system
          notification: {
            message: helpMessage,
            action_url: "/support",
            metadata: {
              clientId: user.id,
              clientName,
              requestTime: new Date().toISOString()
            }
          }
        }
      });

      if (error) throw error;
      
      toast.success("Assistance request sent", {
        description: "A trustee will contact you shortly"
      });
      
      setIsHelpDialogOpen(false);
      setHelpMessage("");
    } catch (error) {
      console.error("Error sending assistance request:", error);
      toast.error("Failed to send request", {
        description: "Please try again or contact your trustee directly"
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <aside className={cn(
      "h-full bg-white dark:bg-background border-r flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="px-4 py-6 border-b flex justify-between items-center">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
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
        ) : (
          <Avatar className="h-12 w-12 border-2 border-primary mx-auto">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {clientInitials}
            </AvatarFallback>
          </Avatar>
        )}

        <Button
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-full h-8 w-8 flex-shrink-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
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
                    isActive ? "bg-primary/10 text-primary" : "",
                    isCollapsed ? "px-0 justify-center" : ""
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {!isCollapsed && (
        <div className="p-4 mt-auto border-t">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Need assistance?</h4>
                <p className="text-xs text-muted-foreground">Contact your trustee</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="sm" 
              onClick={() => setIsHelpDialogOpen(true)}
            >
              Request Help
            </Button>
            
            {/* Help Dialog */}
            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Assistance</DialogTitle>
                  <DialogDescription>
                    Explain what you need help with and a trustee will respond to your request.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder="Please describe what you need help with..."
                    className="min-h-[120px]"
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsHelpDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssistanceRequest} 
                    disabled={isSubmittingRequest || !helpMessage.trim()}
                  >
                    {isSubmittingRequest ? "Sending..." : "Send Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </aside>
  );
};
