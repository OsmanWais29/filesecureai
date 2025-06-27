
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from '@/hooks/useAuthState';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  Settings,
  HelpCircle,
  MessageSquare,
  Calendar,
  CheckSquare,
  Bell,
  FileCheck,
  Calculator,
  Workflow,
  UserCog,
  ClipboardList,
  Archive,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const MainSidebar = ({ collapsed = false, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthState();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    try {
      setSigningOut(true);
      console.log("Signing out from MainSidebar");
      
      await signOut();
      
      toast.success('Signed out successfully');
      
      // Redirect based on user type or default to trustee login
      const userType = user?.user_metadata?.user_type;
      if (userType === 'client') {
        navigate('/client-login', { replace: true });
      } else {
        navigate('/trustee-login', { replace: true });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setSigningOut(false);
    }
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      description: 'Manage and organize files'
    },
    {
      name: 'CRM',
      href: '/crm',
      icon: Users,
      description: 'Client relationship management'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: TrendingUp,
      description: 'Performance metrics'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      description: 'Task management'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Schedule and events'
    },
    {
      name: 'Workflows',
      href: '/workflows',
      icon: Workflow,
      description: 'Process automation'
    },
    {
      name: 'Converter',
      href: '/converter',
      icon: Calculator,
      description: 'Document conversion tools'
    },
    {
      name: 'Income & Expense',
      href: '/income-expense',
      icon: ClipboardList,
      description: 'Financial tracking'
    },
    {
      name: 'SAFA',
      href: '/safa',
      icon: FileCheck,
      description: 'Security audit forms'
    },
    {
      name: 'Audit Trail',
      href: '/audit',
      icon: Archive,
      description: 'System audit logs'
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      description: 'System notifications'
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      description: 'Communication hub'
    },
    {
      name: 'Support',
      href: '/trustee/support',
      icon: HelpCircle,
      description: 'Help and support'
    }
  ];

  const secondaryNavigation = [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCog,
      description: 'User profile settings'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Application settings'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const NavButton = ({ item, isSecondary = false }: { item: any; isSecondary?: boolean }) => {
    const active = isActive(item.href);
    const IconComponent = item.icon;

    return (
      <Button
        key={item.name}
        variant={active ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 h-10 px-3',
          collapsed && 'px-0 justify-center',
          active && 'bg-secondary text-secondary-foreground',
          !collapsed && 'text-left'
        )}
        onClick={() => navigate(item.href)}
        title={collapsed ? item.name : undefined}
      >
        <IconComponent className={cn('h-4 w-4 flex-shrink-0')} />
        {!collapsed && (
          <span className="truncate text-sm font-medium">
            {item.name}
          </span>
        )}
      </Button>
    );
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SF</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold">SecureFiles AI</h1>
              <p className="text-xs text-muted-foreground">Trustee Portal</p>
            </div>
          </div>
        )}
        
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn('h-8 w-8 p-0', collapsed && 'mx-auto')}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {secondaryNavigation.map((item) => (
            <NavButton key={item.href} item={item} isSecondary />
          ))}
        </div>
      </ScrollArea>

      {/* Footer with Sign Out */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10',
            collapsed && 'px-0 justify-center'
          )}
          onClick={handleSignOut}
          disabled={signingOut}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <span className="truncate text-sm font-medium">
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MainSidebar;
