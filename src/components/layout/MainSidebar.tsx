
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BrainCog, Bell, FileText, Home, MessageCircle, PieChart, Settings, User, Users, FileCheck, Menu, X, Convert } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const MainSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

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

  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Documents", path: "/documents" },
    { icon: Convert, label: "Converter", path: "/converter" }, // Added new Converter link
    { icon: MessageCircle, label: "SAFA", path: "/SAFA" },
    { icon: Users, label: "CRM", path: "/crm" },
    { icon: BrainCog, label: "Smart Income Expense", path: "/activity" },
    { icon: FileCheck, label: "Audit Trail", path: "/e-filing" },
    { icon: PieChart, label: "Analytics", path: "/analytics" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  const SidebarContent = () => (
    <>
      {/* App Logo */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          className="w-full justify-start px-2 py-4 hover:bg-transparent"
          onClick={() => handleNavigation('/')}
        >
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/b8620d24-fab6-4068-9af7-3e91ace7b559.png" 
              alt="Secure Files AI Logo" 
              className="w-9 h-9"
            />
            <span className={cn(
              "font-bold text-lg",
              isDarkMode ? "text-white" : "text-black"
            )}>Secure Files AI</span>
          </div>
        </Button>
      </div>

      {/* Navigation Links with ScrollArea */}
      <ScrollArea className="flex-1">
        <nav className="px-3 py-2 space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-4 py-6 h-auto",
                "hover:bg-accent/10 hover:text-accent transition-colors duration-200",
                isActivePath(item.path) && "bg-accent/10 text-accent"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActivePath(item.path) ? "text-accent" : "text-muted-foreground group-hover:text-accent"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isActivePath(item.path) ? 
                  "text-accent" : 
                  isDarkMode ? "text-white" : "text-black"
              )}>
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t">
        <Button 
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-6 h-auto hover:bg-accent/10 hover:text-accent"
          onClick={() => handleNavigation("/settings")}
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className={cn(
            "text-sm font-medium",
            isDarkMode ? "text-white" : "text-black"
          )}>Settings</span>
        </Button>
        
        <Button 
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-6 h-auto hover:bg-accent/10 hover:text-accent"
          onClick={() => handleNavigation("/profile")}
        >
          <User className="h-5 w-5 text-muted-foreground" />
          <span className={cn(
            "text-sm font-medium",
            isDarkMode ? "text-white" : "text-black"
          )}>Profile</span>
        </Button>
      </div>
    </>
  );

  // Mobile menu toggle button
  const MobileMenuButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="fixed top-4 left-4 z-50 md:hidden"
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
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // For desktop: use fixed sidebar
  return (
    <aside className={cn(
      "w-64 h-screen flex flex-col fixed left-0 top-0 z-40 border-r",
      isDarkMode ? "bg-background" : "bg-white"
    )}>
      <SidebarContent />
    </aside>
  );
};
