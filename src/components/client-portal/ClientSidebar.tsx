
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
    href: "/client-portal",
    icon: LayoutDashboard,
    end: true
  },
  {
    title: "Documents",
    href: "/client-portal/documents",
    icon: FileText
  },
  {
    title: "Tasks",
    href: "/client-portal/tasks",
    icon: CheckSquare
  },
  {
    title: "Appointments",
    href: "/client-portal/appointments",
    icon: Calendar
  },
  {
    title: "Support",
    href: "/client-portal/support",
    icon: MessageSquare
  },
  {
    title: "Settings",
    href: "/client-portal/settings",
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
      "flex flex-col h-full bg-white/95 backdrop-blur-sm border-r border-blue-200/50 transition-all duration-300 shadow-lg",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200/50">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-blue-800">Client Portal</h2>
            <p className="text-xs text-blue-600">SecureFiles AI</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="ml-auto hover:bg-blue-100"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-blue-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = item.end 
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href) && location.pathname !== "/client-portal";

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100",
                  isActive 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-blue-700 hover:text-blue-800",
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
      <div className="p-4 border-t border-blue-200/50">
        <div className={cn(
          "text-xs text-blue-600",
          collapsed ? "text-center" : ""
        )}>
          {collapsed ? "v1.0" : "SecureFiles AI v1.0"}
        </div>
      </div>
    </div>
  );
};
