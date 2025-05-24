
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { redirectToSubdomain } from '@/utils/subdomain';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  isActive: boolean;
}

const ClientPortal = () => {
  const { user, loading: authLoading, signOut, isClient } = useAuthState();
  const { role, loading: roleLoading, isClient: isUserClient } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Check if user should be on client portal
  useEffect(() => {
    if (!authLoading && !roleLoading && !redirecting) {
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      if (!isClient) {
        console.log('Not on client subdomain, redirecting');
        toast.error("Please use the client portal for client access");
        setRedirecting(true);
        redirectToSubdomain('client', '/portal');
        return;
      }

      if (role && !isUserClient) {
        console.log('User is not a client, redirecting to trustee portal');
        toast.error("This account doesn't have client access");
        setRedirecting(true);
        redirectToSubdomain('trustee', '/crm');
        return;
      }
    }
  }, [user, role, authLoading, roleLoading, isClient, isUserClient, navigate, redirecting]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/portal',
      isActive: location.pathname === '/portal'
    },
    {
      icon: FileText,
      label: 'Documents',
      path: '/portal/documents',
      isActive: location.pathname === '/portal/documents'
    },
    {
      icon: CheckSquare,
      label: 'Tasks',
      path: '/portal/tasks',
      isActive: location.pathname === '/portal/tasks'
    },
    {
      icon: Calendar,
      label: 'Appointments',
      path: '/portal/appointments',
      isActive: location.pathname === '/portal/appointments'
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/portal/settings',
      isActive: location.pathname === '/portal/settings'
    }
  ];

  if (authLoading || roleLoading || redirecting) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-muted-foreground">
          {redirecting ? 'Redirecting...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!user || (!authLoading && !roleLoading && role && !isUserClient)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the client portal.
            </p>
            <Button onClick={() => navigate('/login')} variant="outline">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-semibold">Client Portal</h1>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'C'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || 'Client User'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={item.isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    item.isActive && "bg-secondary"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => {
                // TODO: Implement notifications
                toast.info('Notifications feature coming soon');
              }}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Client Portal</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientPortal;
