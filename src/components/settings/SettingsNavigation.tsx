
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Users, 
  Database,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: "general",
    label: "General",
    icon: SettingsIcon,
    description: "Basic app preferences"
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Authentication & encryption"
  },
  {
    id: "access-control",
    label: "Access Control",
    icon: Users,
    description: "User permissions & roles"
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Database,
    description: "Third-party connections"
  }
];

export const SettingsNavigation = ({ activeTab, onTabChange }: SettingsNavigationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        {!isCollapsed && !isMobile && (
          <div className="flex items-center gap-3 mb-3">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold text-lg">Settings</h2>
              <p className="text-sm text-muted-foreground">Configure your preferences</p>
            </div>
          </div>
        )}
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 p-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 px-3 py-3 h-auto",
                isCollapsed && !isMobile && "justify-center px-2"
              )}
              onClick={() => {
                onTabChange(item.id);
                if (isMobile) setIsMobileOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "text-xs text-muted-foreground",
          isCollapsed && !isMobile ? "text-center" : ""
        )}>
          {isCollapsed && !isMobile ? "v1.0" : "SecureFiles AI Settings v1.0"}
        </div>
      </div>
    </div>
  );

  // Mobile version with sheet
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <NavigationContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop version
  return (
    <div className={cn(
      "h-full border-r bg-card transition-all duration-300",
      isCollapsed ? "w-16" : "w-80"
    )}>
      <NavigationContent />
    </div>
  );
};
