
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { AuditLogger } from '@/components/audit/AuditLogger';
import { PermissionManager } from '@/components/permissions/PermissionManager';
import { useUserRole } from '@/hooks/useUserRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Shield, Eye, Edit } from 'lucide-react';

export const EnhancedDocumentViewer: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { logView } = useAuditLogger();
  const { role, isAdmin, isTrustee } = useUserRole();

  useEffect(() => {
    if (documentId) {
      // Log document view
      logView(documentId, {
        access_type: 'direct_link',
        referrer: document.referrer
      });
    }
  }, [documentId, logView]);

  if (!documentId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p>Document not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Viewer</h1>
            <p className="text-muted-foreground">Document ID: {documentId}</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Audit Enabled
          </Badge>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Change History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Document Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Document content would be displayed here</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    All interactions are being logged for audit purposes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogger documentId={documentId} showFilters={true} />
          </TabsContent>

          <TabsContent value="permissions">
            {(isAdmin || isTrustee) ? (
              <PermissionManager 
                resourceType="document" 
                resourceId={documentId}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    You don't have permission to view document permissions
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Change History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Detailed change history would be displayed here with before/after values
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
