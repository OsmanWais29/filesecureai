
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RBACSettings } from './RBACSettings';
import { AuditLogs } from './AuditLogs';
import { Shield, Users, FileText } from 'lucide-react';

export const AccessControlDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Access Control & Security</h2>
        <p className="text-muted-foreground">
          Manage user permissions, roles, and monitor system access
        </p>
      </div>

      <Tabs defaultValue="rbac" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rbac" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            RBAC & IP Whitelisting
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rbac">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role-Based Access Control & IP Whitelisting
              </CardTitle>
              <CardDescription>
                Manage user roles, permissions, and IP address restrictions for enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RBACSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Security Audit Logs
              </CardTitle>
              <CardDescription>
                Monitor and review all system access events and security activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
