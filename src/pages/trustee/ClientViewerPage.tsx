
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock
} from "lucide-react";

const TrusteeClientViewerPage = () => {
  const { clientId } = useParams();

  // Mock client data
  const client = {
    id: clientId,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Toronto, ON M5V 3A1",
    dateOfBirth: "1985-03-15",
    sin: "123-456-789",
    status: "Active",
    riskLevel: "Medium",
    totalDebt: "$65,000",
    monthlyIncome: "$4,200",
    monthlyExpenses: "$3,800",
    surplus: "$400",
    proposalAmount: "$25,000",
    createdAt: "2024-12-01",
    lastContact: "2025-01-15"
  };

  const documents = [
    { id: 1, name: "Form 47 - Consumer Proposal", date: "2025-01-15", status: "Completed" },
    { id: 2, name: "Statement of Affairs", date: "2025-01-14", status: "Under Review" },
    { id: 3, name: "Income Tax Returns", date: "2025-01-10", status: "Approved" },
    { id: 4, name: "Proof of Income", date: "2025-01-08", status: "Completed" }
  ];

  const timeline = [
    { date: "2025-01-15", event: "Form 47 submitted", type: "document" },
    { date: "2025-01-12", event: "Client meeting conducted", type: "meeting" },
    { date: "2025-01-10", event: "Initial consultation", type: "meeting" },
    { date: "2025-01-08", event: "Case opened", type: "status" }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client ID: {client.id}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
              {client.status}
            </Badge>
            <Badge variant={client.riskLevel === 'Low' ? 'default' : client.riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
              {client.riskLevel} Risk
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{client.address}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span className="text-sm ml-2">{client.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">SIN:</span>
                    <span className="text-sm ml-2">{client.sin}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Case Opened:</span>
                    <span className="text-sm ml-2">{client.createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{client.totalDebt}</div>
                    <div className="text-sm text-gray-500">Total Debt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{client.monthlyIncome}</div>
                    <div className="text-sm text-gray-500">Monthly Income</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{client.monthlyExpenses}</div>
                    <div className="text-sm text-gray-500">Monthly Expenses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{client.surplus}</div>
                    <div className="text-sm text-gray-500">Surplus</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Proposal Amount:</span>
                    <span className="text-lg font-bold text-green-600">{client.proposalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === 'Completed' ? 'default' : doc.status === 'Approved' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </Button>
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">{item.event}</div>
                        <div className="text-xs text-gray-500">{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment History</span>
                    <Badge variant="default">Good</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Income Stability</span>
                    <Badge variant="secondary">Fair</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Debt-to-Income Ratio</span>
                    <Badge variant="secondary">Moderate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeClientViewerPage;
