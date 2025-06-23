
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Brain,
  DollarSign,
  FileSearch,
  Eye,
  Lock,
  CheckSquare,
  Bell,
  Calendar,
  Search,
  TrendingUp,
  Activity,
  Zap
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
      description: 'Main overview and statistics',
      badge: null
    },
    { 
      name: 'Document Management', 
      href: '/documents', 
      icon: FileText,
      description: 'Upload, organize, and manage documents',
      badge: null
    },
    { 
      name: 'SAFA - AI Assistant', 
      href: '/safa', 
      icon: Brain,
      description: 'Smart AI Financial Assistant',
      badge: 'AI'
    },
    { 
      name: 'CRM & Client Portal', 
      href: '/crm', 
      icon: Users,
      description: 'Manage client relationships',
      badge: null
    },
    { 
      name: 'Advanced Features', 
      href: '/advanced-features', 
      icon: Zap,
      description: 'PDF to XML, Smart Income, Analytics',
      badge: 'Pro'
    },
    { 
      name: 'Audit Trail', 
      href: '/audit-trail', 
      icon: Shield,
      description: 'Security logs and compliance tracking',
      badge: null
    },
    { 
      name: 'Advanced Audit', 
      href: '/audit-advanced', 
      icon: Eye,
      description: 'Detailed audit analytics',
      badge: null
    },
    { 
      name: 'Production Audit', 
      href: '/audit', 
      icon: Lock,
      description: 'Production environment logs',
      badge: null
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'Application configuration',
      badge: null
    }
  ];

  const quickActions = [
    { name: 'Search Documents', icon: Search, action: () => console.log('Search'), color: 'text-blue-600' },
    { name: 'Notifications', icon: Bell, action: () => console.log('Notifications'), color: 'text-orange-600' },
    { name: 'Calendar', icon: Calendar, action: () => console.log('Calendar'), color: 'text-green-600' },
    { name: 'Tasks', icon: CheckSquare, action: () => console.log('Tasks'), color: 'text-purple-600' }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    window.dispatchEvent(new CustomEvent('sidebarCollapse', { 
      detail: { collapsed: !collapsed } 
    }));
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-gradient-to-b from-card to-card/95 border-r border-border/50 backdrop-blur-sm transition-all duration-300 z-40 flex flex-col shadow-xl",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        {!collapsed && (
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SecureFiles AI
            </h1>
            <p className="text-xs text-muted-foreground">Trustee Portal</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="ml-auto hover:bg-primary/10"
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
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.name : ''}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <div className="flex flex-col flex-1">
                        <span className="flex items-center gap-2">
                          {item.name}
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "secondary" : "outline"} 
                              className="text-xs px-1.5 py-0.5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                          {item.description}
                        </span>
                      </div>
                    </>
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-l-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <ul className="space-y-1">
              {quickActions.map((action) => (
                <li key={action.name}>
                  <Button
                    variant="ghost"
                    onClick={action.action}
                    className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10"
                  >
                    <action.icon className={`h-4 w-4 flex-shrink-0 ${action.color}`} />
                    <span>{action.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Enhanced Status Indicators */}
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="px-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">System Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Compliance</span>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">98.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AI Processing</span>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Footer */}
      <div className="p-2 border-t border-border/50 bg-gradient-to-r from-muted/30 to-muted/20">
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
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
