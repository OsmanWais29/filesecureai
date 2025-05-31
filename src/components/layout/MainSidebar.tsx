
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  BrainCog, Bell, FileText, Home, MessageCircle, PieChart, Settings, 
  User, Users, FileCheck, Menu, X, FileSearch, ChevronRight, ChevronLeft 
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const MainSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Emit custom event when sidebar collapses/expands
  useEffect(() => {
    // Create and dispatch a custom event for sidebar collapse
    const customEvent = new CustomEvent('sidebarCollapse', { 
      detail: { collapsed: isCollapsed } 
    });
    window.dispatchEvent(customEvent);

    // Small delay to allow transition to complete
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  // Set CSS custom property for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '4rem' : '16rem'
    );

    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [isCollapsed]);

  // Navigation item definitions with updated SAFA path
  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Documents", path: "/documents" },
    { icon: FileSearch, label: "Converter", path: "/converter" },
    { icon: MessageCircle, label: "SAFA", path: "/SAFA" },
    { icon: Users, label: "CRM", path: "/crm" },
    { icon: BrainCog, label: "Smart Income Expense", path: "/activity" },
    { icon: FileCheck, label: "Audit Trail", path: "/e-filing" },
    { icon: PieChart, label: "Analytics", path: "/analytics" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/index";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <>
      {/* App Logo */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-background">
        {!isCollapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start px-2 py-4 hover:bg-accent/10 text-foreground"
            onClick={() => handleNavigation('/')}
          >
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/b8620d24-fab6-4068-9af7-3e91ace7b559.png" 
                alt="Secure Files AI Logo" 
                className="w-9 h-9"
              />
              <span className="font-bold text-lg text-foreground">
                Secure Files AI
              </span>
            </div>
          </Button>
        )}

        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-full h-8 w-8 flex-shrink-0 hover:bg-accent/10 text-foreground"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation Links with ScrollArea */}
      <ScrollArea className="flex-1 bg-background">
        <nav className="px-3 py-2 space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-4 py-6 h-auto text-foreground",
                "hover:bg-accent/10 hover:text-accent transition-colors duration-200",
                isActivePath(item.path) && "bg-accent/10 text-accent"
              )}
              onClick={() => handleNavigation(item.path)}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActivePath(item.path) ? "text-accent" : "text-muted-foreground group-hover:text-accent"
              )} />
              {!isCollapsed && (
                <span className={cn(
                  "text-sm font-medium",
                  isActivePath(item.path) ? "text-accent" : "text-foreground"
                )}>
                  {item.label}
                </span>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-border bg-background">
        <Button 
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-4 py-6 h-auto hover:bg-accent/10 hover:text-accent text-foreground",
            isActivePath("/settings") && "bg-accent/10 text-accent"
          )}
          onClick={() => handleNavigation("/settings")}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className={cn(
            "h-5 w-5", 
            isActivePath("/settings") ? "text-accent" : "text-muted-foreground"
          )} />
          {!isCollapsed && (
            <span className={cn(
              "text-sm font-medium",
              isActivePath("/settings") ? "text-accent" : "text-foreground"
            )}>Settings</span>
          )}
        </Button>
        
        <Button 
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-4 py-6 h-auto hover:bg-accent/10 hover:text-accent text-foreground",
            isActivePath("/profile") && "bg-accent/10 text-accent"
          )}
          onClick={() => handleNavigation("/profile")}
          title={isCollapsed ? "Profile" : undefined}
        >
          <User className={cn(
            "h-5 w-5", 
            isActivePath("/profile") ? "text-accent" : "text-muted-foreground"
          )} />
          {!isCollapsed && (
            <span className={cn(
              "text-sm font-medium",
              isActivePath("/profile") ? "text-accent" : "text-foreground"
            )}>Profile</span>
          )}
        </Button>
      </div>
    </>
  );

  // Mobile menu toggle button
  const MobileMenuButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="fixed top-4 left-4 z-50 md:hidden bg-background text-foreground hover:bg-accent/10"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );

  // For mobile: use sheet component
  if (isMobile) {
    return (
      <>
        <MobileMenuButton />
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-background">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // For desktop: use fixed sidebar
  return (
    <aside className={cn(
      "h-screen flex flex-col fixed left-0 top-0 z-40 border-r border-border shadow-sm transition-all duration-300 bg-background",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <SidebarContent />
    </aside>
  );
};
