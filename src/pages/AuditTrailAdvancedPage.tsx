
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLogger } from '@/components/audit/AuditLogger';
import { DetailedAuditView } from '@/components/audit/DetailedAuditView';
import { PermissionManager } from '@/components/permissions/PermissionManager';
import { 
  Shield, 
  FileText, 
  Users, 
  Settings,
  Download,
  Lock
} from 'lucide-react';

const AuditTrailAdvancedPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  // Mock documents for demonstration
  const documents = [
    { id: 'doc-1', title: 'Form 47 - Consumer Proposal.pdf' },
    { id: 'doc-2', title: 'Financial Statement.xlsx' },
    { id: 'doc-3', title: 'Client Agreement.pdf' }
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Audit Trail & Permissions
          </h1>
          <p className="text-muted-foreground">
            Comprehensive audit logging and permission management system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Detailed View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Audit Entries
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,547</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Encrypted Logs
                  </CardTitle>
                  <Lock className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">
                    All logs encrypted & immutable
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">43</div>
                  <p className="text-xs text-muted-foreground">
                    Across all permission levels
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Security Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">✅ Implemented Features</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Real-time audit logging for all actions</li>
                        <li>• Role-based data masking</li>
                        <li>• Encrypted and immutable log storage</li>
                        <li>• Exportable compliance reports</li>
                        <li>• Permission management interface</li>
                        <li>• Change tracking with before/after values</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">🔐 Security Measures</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• End-to-end encryption</li>
                        <li>• IP address logging</li>
                        <li>• User agent tracking</li>
                        <li>• Timestamp verification</li>
                        <li>• Access control enforcement</li>
                        <li>• Automatic backup and retention</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogger showFilters={true} />
          </TabsContent>

          <TabsContent value="permissions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="space-y-4">
                        <h3 className="font-medium">{doc.title}</h3>
                        <PermissionManager 
                          resourceType="document" 
                          resourceId={doc.id}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Document for Detailed Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <Card 
                        key={doc.id}
                        className={`cursor-pointer transition-colors ${
                          selectedDocument === doc.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedDocument(doc.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">{doc.title}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedDocument && (
                <DetailedAuditView 
                  documentId={selectedDocument}
                  documentTitle={documents.find(d => d.id === selectedDocument)?.title || ''}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AuditTrailAdvancedPage;
