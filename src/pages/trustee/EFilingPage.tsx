
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye,
  Send
} from "lucide-react";

const TrusteeEFilingPage = () => {
  const auditTrail = [
    {
      id: 1,
      action: "Document Uploaded",
      document: "Form 47 - John Doe",
      user: "Trustee Smith",
      timestamp: "2025-01-15 09:30:00",
      ipAddress: "192.168.1.100",
      status: "success"
    },
    {
      id: 2,
      action: "Risk Assessment Completed",
      document: "Form 47 - John Doe", 
      user: "System AI",
      timestamp: "2025-01-15 09:35:15",
      ipAddress: "Internal",
      status: "success"
    },
    {
      id: 3,
      action: "Document Reviewed",
      document: "Form 47 - John Doe",
      user: "Trustee Smith",
      timestamp: "2025-01-15 10:15:22",
      ipAddress: "192.168.1.100", 
      status: "success"
    },
    {
      id: 4,
      action: "E-Filing Attempted",
      document: "Form 65 - Jane Smith",
      user: "Trustee Johnson",
      timestamp: "2025-01-15 11:20:45",
      ipAddress: "192.168.1.101",
      status: "error"
    },
    {
      id: 5,
      action: "Document Downloaded",
      document: "Statement of Affairs - Mike Wilson",
      user: "Trustee Brown",
      timestamp: "2025-01-15 14:45:33",
      ipAddress: "192.168.1.102",
      status: "success"
    }
  ];

  const pendingFilings = [
    {
      id: 1,
      document: "Form 47 - Consumer Proposal",
      client: "John Doe",
      deadline: "2025-01-20",
      status: "Ready to File",
      priority: "high"
    },
    {
      id: 2,
      document: "Form 65 - Assignment in Bankruptcy",
      client: "Jane Smith", 
      deadline: "2025-01-18",
      status: "Under Review",
      priority: "medium"
    },
    {
      id: 3,
      document: "Statement of Affairs",
      client: "Mike Wilson",
      deadline: "2025-01-25",
      status: "Pending Approval",
      priority: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return AlertTriangle;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">E-Filing & Audit Trail</h1>
            <p className="text-gray-600 mt-1">Track document submissions and maintain compliance audit trails.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Audit Log
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Submit Filing
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Filings</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87</div>
              <p className="text-xs text-muted-foreground">+12 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <p className="text-xs text-muted-foreground">Awaiting submission</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">84</div>
              <p className="text-xs text-muted-foreground">96.5% success rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">Above industry standard</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending E-Filings */}
          <Card>
            <CardHeader>
              <CardTitle>Pending E-Filings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingFilings.map((filing) => (
                  <div key={filing.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{filing.document}</h4>
                        <p className="text-sm text-gray-600">Client: {filing.client}</p>
                      </div>
                      <Badge className={getPriorityColor(filing.priority)}>
                        {filing.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Deadline: </span>
                        <span className="font-medium">{filing.deadline}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" disabled={filing.status !== 'Ready to File'}>
                          <Send className="h-4 w-4 mr-1" />
                          File
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        filing.status === 'Ready to File' ? 'bg-green-100 text-green-800' :
                        filing.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {filing.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTrail.map((entry) => {
                  const StatusIcon = getStatusIcon(entry.status);
                  return (
                    <div key={entry.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <StatusIcon className={`h-4 w-4 mt-0.5 ${getStatusColor(entry.status)}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm">{entry.action}</h4>
                              <p className="text-xs text-gray-600">{entry.document}</p>
                            </div>
                            <span className="text-xs text-gray-500">{entry.timestamp}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            <span>User: {entry.user}</span>
                            <span className="mx-2">•</span>
                            <span>IP: {entry.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View Full Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600">BIA Compliance</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">45</div>
                <div className="text-sm text-gray-600">Forms Processed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">2.3</div>
                <div className="text-sm text-gray-600">Avg Days to File</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeEFilingPage;
