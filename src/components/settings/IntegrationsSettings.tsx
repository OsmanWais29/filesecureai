
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, ExternalLink, Settings, CheckCircle, AlertCircle } from "lucide-react";

export const IntegrationsSettings = () => {
  const integrations = [
    {
      name: "Supabase Database",
      description: "Primary database for SecureFiles AI",
      status: "connected",
      icon: Database
    },
    {
      name: "Outlook Calendar",
      description: "Sync meetings and appointments",
      status: "disconnected",
      icon: ExternalLink
    },
    {
      name: "OneDrive",
      description: "Cloud storage integration",
      status: "connected",
      icon: ExternalLink
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Third-Party Integrations
          </CardTitle>
          <CardDescription>
            Manage connections to external services and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <integration.icon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={integration.status === "connected" ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {integration.status === "connected" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {integration.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys & Webhooks</CardTitle>
          <CardDescription>
            Manage API access and webhook configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">API Access</h3>
                <p className="text-sm text-muted-foreground">Generate and manage API keys</p>
              </div>
              <Button variant="outline">
                Generate Key
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Webhooks</h3>
                <p className="text-sm text-muted-foreground">Configure webhook endpoints</p>
              </div>
              <Button variant="outline">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
