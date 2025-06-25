
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    // Handle file upload logic here
  };

  const recentDocuments = [
    {
      id: 1,
      name: "Form 47 - Consumer Proposal",
      client: "John Smith",
      date: "2 hours ago",
      status: "Processing",
      type: "PDF"
    },
    {
      id: 2,
      name: "Financial Statement",
      client: "Sarah Johnson",
      date: "4 hours ago",
      status: "Completed",
      type: "Excel"
    },
    {
      id: 3,
      name: "Asset Inventory",
      client: "Mike Wilson",
      date: "1 day ago",  
      status: "Review Required",
      type: "PDF"
    },
    {
      id: 4,
      name: "Form 65 - Assignment",
      client: "Lisa Brown",
      date: "2 days ago",
      status: "Completed",
      type: "PDF"
    }
  ];

  const recentClients = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      lastActivity: "2 hours ago",
      status: "Active",
      caseType: "Consumer Proposal"
    },
    {
      id: 2,
      name: "Sarah Johnson", 
      email: "sarah.j@email.com",
      lastActivity: "4 hours ago",
      status: "Under Review",
      caseType: "Bankruptcy"
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "m.wilson@email.com", 
      lastActivity: "1 day ago",
      status: "Pending",
      caseType: "Proposal"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'review required': return 'bg-orange-100 text-orange-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'under review': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="flex-1 p-6 space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SecureFiles AI
          </h1>
          <p className="text-gray-600 text-lg">
            Licensed Insolvency Trustee Portal - Upload, analyze, and manage your documents with advanced AI assistance
          </p>
        </div>

        {/* Upload Section */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Upload Documents</CardTitle>
            <CardDescription>
              Drag and drop your files here or click to browse. Supported formats: PDF, Excel, Word, Images
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
            />
            <label htmlFor="file-upload">
              <Button className="cursor-pointer" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                {selectedFiles.length} file(s) selected
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </CardTitle>
                <CardDescription>
                  Recently uploaded and processed documents
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-600">
                        {doc.client} • {doc.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recently Accessed Clients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recently Accessed Clients
                </CardTitle>
                <CardDescription>
                  Your most recently accessed client files
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/trustee/crm')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-gray-600">
                        {client.caseType} • {client.lastActivity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(client.status)}`}>
                      {client.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/trustee/documents')}
              >
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Analyze Document</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/trustee/crm')}
              >
                <Users className="h-6 w-6 text-green-600" />
                <span className="text-sm">Manage Clients</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/safa')}
              >
                <Search className="h-6 w-6 text-purple-600" />
                <span className="text-sm">SAFA Assistant</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/trustee/reports')}
              >
                <Download className="h-6 w-6 text-orange-600" />
                <span className="text-sm">Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
