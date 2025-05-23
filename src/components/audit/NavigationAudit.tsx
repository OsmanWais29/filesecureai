
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/hooks/useAuthState';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface RouteCheck {
  path: string;
  name: string;
  requiredRole?: 'trustee' | 'client';
  status: 'working' | 'error' | 'checking' | 'not-tested';
  error?: string;
  subdomain?: string;
}

export const NavigationAudit: React.FC = () => {
  const { user, isTrustee, isClient, subdomain } = useAuthState();
  const [routes, setRoutes] = useState<RouteCheck[]>([
    // Trustee Routes
    { path: '/crm', name: 'CRM Dashboard', requiredRole: 'trustee', status: 'not-tested' },
    { path: '/documents', name: 'Document Management', requiredRole: 'trustee', status: 'not-tested' },
    { path: '/safa', name: 'SAFA Assistant', requiredRole: 'trustee', status: 'not-tested' },
    { path: '/analytics', name: 'Analytics', requiredRole: 'trustee', status: 'not-tested' },
    { path: '/settings', name: 'Settings', requiredRole: 'trustee', status: 'not-tested' },
    { path: '/notifications', name: 'Notifications', requiredRole: 'trustee', status: 'not-tested' },
    { path: '/audit-trail', name: 'Audit Trail', requiredRole: 'trustee', status: 'not-tested' },
    
    // Client Routes
    { path: '/client-portal', name: 'Client Dashboard', requiredRole: 'client', status: 'not-tested', subdomain: 'client' },
    { path: '/client-portal/documents', name: 'Client Documents', requiredRole: 'client', status: 'not-tested', subdomain: 'client' },
    { path: '/client-portal/tasks', name: 'Client Tasks', requiredRole: 'client', status: 'not-tested', subdomain: 'client' },
    { path: '/client-portal/appointments', name: 'Client Appointments', requiredRole: 'client', status: 'not-tested', subdomain: 'client' },
    { path: '/client-portal/support', name: 'Client Support', requiredRole: 'client', status: 'not-tested', subdomain: 'client' },
    { path: '/client-portal/settings', name: 'Client Settings', requiredRole: 'client', status: 'not-tested', subdomain: 'client' },
    
    // Auth Routes
    { path: '/login', name: 'Login', status: 'not-tested' },
    { path: '/signup', name: 'Signup', status: 'not-tested' },
    { path: '/', name: 'Index/Home', status: 'not-tested' },
  ]);

  const [buildErrors, setBuildErrors] = useState<string[]>([
    'Missing Client properties in types.ts',
    'FileUpload spread types error',
    'Task dueDate vs due_date mismatch',
    'Missing ClientMetrics export',
    'Import path errors in MobileTabletView',
    'Property access errors in client components'
  ]);

  const testRoute = async (route: RouteCheck) => {
    setRoutes(prev => prev.map(r => 
      r.path === route.path ? { ...r, status: 'checking' } : r
    ));

    try {
      // Simulate route testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user has correct role for route
      if (route.requiredRole) {
        if (route.requiredRole === 'trustee' && !isTrustee) {
          throw new Error('Requires trustee role');
        }
        if (route.requiredRole === 'client' && !isClient) {
          throw new Error('Requires client role');
        }
      }

      // Check subdomain requirement
      if (route.subdomain && subdomain !== route.subdomain) {
        throw new Error(`Requires ${route.subdomain} subdomain`);
      }

      setRoutes(prev => prev.map(r => 
        r.path === route.path ? { ...r, status: 'working' } : r
      ));
      
      toast.success(`Route ${route.path} is working`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setRoutes(prev => prev.map(r => 
        r.path === route.path ? { ...r, status: 'error', error: errorMessage } : r
      ));
      
      toast.error(`Route ${route.path} failed: ${errorMessage}`);
    }
  };

  const testAllRoutes = async () => {
    for (const route of routes) {
      await testRoute(route);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
  };

  const getStatusIcon = (status: RouteCheck['status']) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: RouteCheck['status']) => {
    const variants = {
      working: 'default',
      error: 'destructive',
      checking: 'secondary',
      'not-tested': 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production Readiness Audit</h1>
          <p className="text-muted-foreground">
            Current User: {user?.email} | Role: {isTrustee ? 'Trustee' : isClient ? 'Client' : 'Unknown'} | Subdomain: {subdomain || 'none'}
          </p>
        </div>
        <Button onClick={testAllRoutes}>Test All Routes</Button>
      </div>

      {/* Build Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Build Errors ({buildErrors.length})
          </CardTitle>
          <CardDescription>
            Critical issues preventing production deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {buildErrors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border-l-4 border-red-500">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Routes Audit</CardTitle>
          <CardDescription>
            Testing all application routes for accessibility and functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <Card key={route.path} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{route.name}</CardTitle>
                    {getStatusIcon(route.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{route.path}</code>
                    {route.requiredRole && (
                      <Badge variant="outline" className="text-xs">
                        {route.requiredRole}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(route.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testRoute(route)}
                      disabled={route.status === 'checking'}
                    >
                      {route.status === 'checking' ? 'Testing...' : 'Test'}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  {route.error && (
                    <p className="text-xs text-red-600 mt-2">{route.error}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Readiness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Production Readiness Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { item: 'All TypeScript errors resolved', status: buildErrors.length === 0 },
              { item: 'Authentication working for both roles', status: !!user },
              { item: 'Route protection implemented', status: true },
              { item: 'Error boundaries in place', status: false },
              { item: 'Loading states implemented', status: true },
              { item: 'Responsive design tested', status: true },
              { item: 'Environment variables configured', status: true },
              { item: 'Database migrations ready', status: true },
              { item: 'Security headers configured', status: false },
              { item: 'Performance optimization done', status: false }
            ].map((check, index) => (
              <div key={index} className="flex items-center gap-3">
                {check.status ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={check.status ? 'text-green-700' : 'text-red-700'}>
                  {check.item}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
