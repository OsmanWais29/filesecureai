
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/portal",
    icon: LayoutDashboard,
    end: true
  },
  {
    title: "Documents",
    href: "/portal/documents",
    icon: FileText
  },
  {
    title: "Tasks",
    href: "/portal/tasks",
    icon: CheckSquare
  },
  {
    title: "Appointments",
    href: "/portal/appointments",
    icon: Calendar
  },
  {
    title: "Support",
    href: "/portal/support",
    icon: MessageSquare
  },
  {
    title: "Settings",
    href: "/portal/settings",
    icon: Settings
  }
];

export const ClientSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Emit collapse event for layout to listen to
  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    
    // Dispatch custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('clientSidebarCollapse', {
      detail: { collapsed: newCollapsed }
    }));
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-primary">Client Portal</h2>
            <p className="text-xs text-muted-foreground">SecureFiles AI</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = item.end 
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted",
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-muted-foreground hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0")} />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className={cn(
          "text-xs text-muted-foreground",
          collapsed ? "text-center" : ""
        )}>
          {collapsed ? "v1.0" : "SecureFiles AI v1.0"}
        </div>
      </div>
    </div>
  );
};
