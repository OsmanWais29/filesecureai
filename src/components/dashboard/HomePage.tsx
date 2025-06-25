
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';
import { 
  Upload, 
  FileText, 
  Users, 
  Clock, 
  Activity,
  Folder,
  ChevronRight,
  MessageSquare,
  Home,
  Settings,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const recentDocuments = [
    { id: 1, name: "Form 47 - Consumer Proposal.pdf", type: "PDF", uploadedAt: "2 hours ago", client: "John Smith" },
    { id: 2, name: "Financial Statement.xlsx", type: "Excel", uploadedAt: "4 hours ago", client: "Sarah Johnson" },
    { id: 3, name: "Bank Statement.pdf", type: "PDF", uploadedAt: "1 day ago", client: "Mike Wilson" },
    { id: 4, name: "Income Tax Return.pdf", type: "PDF", uploadedAt: "2 days ago", client: "Emily Davis" }
  ];

  const recentClients = [
    { id: 1, name: "John Smith", lastAccessed: "30 minutes ago", status: "Active", caseType: "Consumer Proposal" },
    { id: 2, name: "Sarah Johnson", lastAccessed: "2 hours ago", status: "Under Review", caseType: "Bankruptcy" },
    { id: 3, name: "Mike Wilson", lastAccessed: "1 day ago", status: "Pending", caseType: "Debt Restructuring" },
    { id: 4, name: "Emily Davis", lastAccessed: "2 days ago", status: "Completed", caseType: "Assignment" }
  ];

  const sidebarItems = [
    { icon: Home, label: "Home", active: true },
    { icon: MessageSquare, label: "SAFA AI", onClick: () => navigate('/safa') },
    { icon: FileText, label: "Documents", onClick: () => navigate('/documents') },
    { icon: Users, label: "Clients", onClick: () => navigate('/clients') },
    { icon: Activity, label: "Analytics", onClick: () => navigate('/analytics') },
    { icon: Settings, label: "Settings", onClick: () => navigate('/settings') }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ChatGPT-style Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SecureFiles AI</span>
            </div>
          )}
          
          <Button
            onClick={() => navigate('/documents')}
            className={`${isSidebarCollapsed ? 'w-8 h-8 p-0' : 'w-full'} bg-gray-800 hover:bg-gray-700 border border-gray-600`}
            size={isSidebarCollapsed ? "sm" : "default"}
          >
            <PlusCircle className="h-4 w-4" />
            {!isSidebarCollapsed && <span className="ml-2">Upload Document</span>}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2">
          <nav className="space-y-1">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
            {!isSidebarCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SecureFiles AI</h1>
            <p className="text-gray-600">Licensed Insolvency Trustee Portal - Streamline your document management and client services</p>
          </div>

          {/* Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onUploadComplete={(documentId) => console.log('Upload complete:', documentId)} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.client}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{doc.uploadedAt}</p>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{doc.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/documents')}
                >
                  View All Documents
                </Button>
              </CardContent>
            </Card>

            {/* Recently Accessed Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recently Accessed Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.caseType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{client.lastAccessed}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          client.status === 'Active' ? 'bg-green-100 text-green-700' :
                          client.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                          client.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/clients')}
                >
                  View All Clients
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate('/safa')}
                >
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">SAFA AI</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate('/converter')}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">PDF Converter</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate('/income-expense')}
                >
                  <Folder className="h-6 w-6" />
                  <span className="text-sm">Income/Expense</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => navigate('/analytics')}
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
