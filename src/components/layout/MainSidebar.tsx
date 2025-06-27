
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell,
  DollarSign,
  Activity,
  FileCode,
  User,
  MessageSquare,
  LifeBuoy
} from "lucide-react";

export const MainSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "PDF to XML Converter", href: "/converter", icon: FileCode },
    { name: "SAFA", href: "/safa", icon: MessageSquare },
    { name: "CRM", href: "/trustee/crm", icon: Users },
    { name: "Smart Income Expense", href: "/income-expense", icon: DollarSign },
    { name: "Audit Trail", href: "/audit", icon: Activity },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Support", href: "/trustee/support", icon: LifeBuoy },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Dispatch custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('sidebarCollapse', { 
      detail: { collapsed: !collapsed } 
    }));
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SecureFiles AI
                </span>
                <p className="text-xs text-gray-500">Licensed Insolvency Trustee</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href === "/" && location.pathname === "/");
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      collapsed && "justify-center px-2",
                      isActive && "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 text-center">
              Licensed Insolvency Trustee Portal
            </div>
            <div className="text-xs text-gray-400 text-center">
              SecureFiles AI v2.1 - Professional Edition
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
