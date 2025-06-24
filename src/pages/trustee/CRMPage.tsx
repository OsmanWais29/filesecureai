
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Plus,
  Filter,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  Edit,
  MessageSquare,
  Upload
} from "lucide-react";

const TrusteeCRMPage = () => {
  const [selectedClient, setSelectedClient] = useState(null);

  const clients = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      status: "Active",
      province: "Ontario", 
      lastContact: "2024-06-20",
      riskLevel: "Medium",
      caseType: "Consumer Proposal",
      totalDebt: "$45,000",
      monthlyIncome: "$3,200"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com", 
      phone: "(555) 234-5678",
      status: "Pending",
      province: "British Columbia",
      lastContact: "2024-06-18",
      riskLevel: "High",
      caseType: "Bankruptcy",
      totalDebt: "$78,000",
      monthlyIncome: "$2,800"
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      phone: "(555) 345-6789", 
      status: "Under Review",
      province: "Alberta",
      lastContact: "2024-06-15",
      riskLevel: "Low",
      caseType: "Division I Proposal",
      totalDebt: "$32,000",
      monthlyIncome: "$4,500"
    }
  ];

  const stats = [
    { title: "Total Clients", value: "127", icon: Users, change: "+12 this month" },
    { title: "Active Cases", value: "89", icon: FileText, change: "+5 this week" },
    { title: "High Risk", value: "8", icon: AlertTriangle, change: "Needs attention" },
    { title: "Revenue", value: "$347K", icon: DollarSign, change: "+18% this quarter" }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Relationship Management</h1>
            <p className="text-gray-600 mt-1">Manage client relationships, cases, and communications for your insolvency practice.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Clients
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clients">Client Management</TabsTrigger>
            <TabsTrigger value="intake">Digital Intake</TabsTrigger>
            <TabsTrigger value="documents">Document Sharing</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search clients by name, case type, or province..." 
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Client List */}
            <Card>
              <CardHeader>
                <CardTitle>Client Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">{client.name}</h3>
                            <Badge className={getStatusColor(client.status)}>
                              {client.status}
                            </Badge>
                            <Badge className={getRiskColor(client.riskLevel)}>
                              {client.riskLevel} Risk
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {client.province}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last: {client.lastContact}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">Case Type:</span>
                              <p className="font-medium">{client.caseType}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Debt:</span>
                              <p className="font-medium">{client.totalDebt}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Monthly Income:</span>
                              <p className="font-medium">{client.monthlyIncome}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          View Case
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intake">
            <Card>
              <CardHeader>
                <CardTitle>Digital Client Intake System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Streamlined Client Onboarding</h3>
                  <p className="text-gray-600 mb-6">AI-powered intake forms with automated data processing and validation.</p>
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Intake Form
                    </Button>
                    <Button variant="outline">
                      View Templates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Secure Document Sharing & E-Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Document Management Hub</h3>
                  <p className="text-gray-600 mb-6">Secure document sharing with built-in e-signature capabilities and audit trails.</p>
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Share Documents
                    </Button>
                    <Button variant="outline">
                      E-Signature Templates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle>Client Communications Center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Unified Communication Hub</h3>
                  <p className="text-gray-600 mb-6">Manage all client communications, meetings, and follow-ups in one place.</p>
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Conversation
                    </Button>
                    <Button variant="outline">
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TrusteeCRMPage;
