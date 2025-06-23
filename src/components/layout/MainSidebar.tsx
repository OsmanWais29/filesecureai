
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  Shield,
  BarChart3,
  Menu,
  ChevronLeft,
  LogOut,
  FolderOpen,
  Search,
  Bell,
  Calendar,
  TrendingUp,
  Database,
  MessageSquare,
  HelpCircle,
  Archive,
  CheckSquare,
  AlertTriangle,
  UserCheck,
  Building,
  CreditCard,
  FileCheck,
  Activity,
  Brain,
  Lock,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthState } from '@/hooks/useAuthState';

export const MainSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuthState();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home,
      description: 'Main overview and statistics'
    },
    { 
      name: 'Document Management', 
      href: '/documents', 
      icon: FileText,
      description: 'Upload, organize, and manage documents'
    },
    { 
      name: 'Client Portal', 
      href: '/crm', 
      icon: Users,
      description: 'Manage client relationships and communications'
    },
    { 
      name: 'AI Analysis', 
      href: '/safa', 
      icon: Brain,
      description: 'Advanced AI document analysis and insights'
    },
    { 
      name: 'Analytics & Reports', 
      href: '/advanced-features', 
      icon: BarChart3,
      description: 'Business intelligence and reporting'
    },
    { 
      name: 'Audit Trail', 
      href: '/audit-trail', 
      icon: Shield,
      description: 'Security logs and compliance tracking'
    },
    { 
      name: 'Advanced Audit', 
      href: '/audit-advanced', 
      icon: Eye,
      description: 'Detailed audit analytics and monitoring'
    },
    { 
      name: 'Production Audit', 
      href: '/audit', 
      icon: Lock,
      description: 'Production environment audit logs'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'Application configuration and preferences'
    }
  ];

  const quickActions = [
    { name: 'Search Documents', icon: Search, action: () => console.log('Search') },
    { name: 'Notifications', icon: Bell, action: () => console.log('Notifications') },
    { name: 'Calendar', icon: Calendar, action: () => console.log('Calendar') },
    { name: 'Tasks', icon: CheckSquare, action: () => console.log('Tasks') }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Dispatch custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('sidebarCollapse', { 
      detail: { collapsed: !collapsed } 
    }));
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary">SecureFiles AI</h1>
            <p className="text-xs text-muted-foreground">Trustee Portal</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.name : ''}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs opacity-70 group-hover:opacity-100">
                        {item.description}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h3>
            <ul className="mt-2 space-y-1">
              {quickActions.map((action) => (
                <li key={action.name}>
                  <Button
                    variant="ghost"
                    onClick={action.action}
                    className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <action.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{action.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status Indicators */}
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="px-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">System Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Compliance</span>
                <div className="flex items-center gap-1">
                  <CheckSquare className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">98.5%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign Out" : ''}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};
