
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
  ChevronRight,
  Shield
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
      "flex flex-col h-full bg-white shadow-xl border-r border-blue-100 transition-all duration-300",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-blue-100">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Client Portal</h2>
              <p className="text-sm text-blue-600 font-medium">SecureFiles AI</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="ml-auto hover:bg-blue-50 text-blue-600 rounded-xl"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
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
                  "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-blue-50 group",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                    : "text-gray-700 hover:text-blue-600",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                )} />
                {!collapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-blue-100">
        <div className={cn(
          "text-center",
          collapsed ? "text-xs" : "text-sm"
        )}>
          <div className="text-gray-500 font-medium">
            {collapsed ? "v1.0" : "SecureFiles AI"}
          </div>
          {!collapsed && (
            <div className="text-xs text-gray-400 mt-1">
              Client Portal v1.0
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
