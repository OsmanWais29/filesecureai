
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Clock
} from "lucide-react";
import { DocumentVault } from "@/components/crm/DocumentVault";

const TrusteeCRMPage = () => {
  const clients = [
    {
      id: "1",
      name: "Josh Hart",
      email: "josh.hart@email.com",
      phone: "(555) 123-4567",
      status: "Active",
      province: "Ontario", 
      lastContact: "2024-06-20",
      riskLevel: "Medium",
      caseType: "Consumer Proposal",
      documents: 8,
      needsAttention: true
    },
    {
      id: "2", 
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 234-5678",
      status: "Pending Review",
      province: "British Columbia",
      lastContact: "2024-06-18",
      riskLevel: "High",
      caseType: "Bankruptcy",
      documents: 12,
      needsAttention: true
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "m.chen@email.com", 
      phone: "(555) 345-6789",
      status: "Completed",
      province: "Alberta",
      lastContact: "2024-06-15",
      riskLevel: "Low",
      caseType: "Debt Consolidation",
      documents: 15,
      needsAttention: false
    }
  ];

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Low": return "bg-green-100 text-green-800 hover:bg-green-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-100 text-blue-800";
      case "Pending Review": return "bg-orange-100 text-orange-800";
      case "Completed": return "bg-green-100 text-green-800";
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
            <p className="text-gray-600 mt-1">Manage your client relationships with AI-powered insights and document processing.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Client
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search clients by name, email, or case number..." 
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">68% completion rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$127K</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{client.name}</h3>
                          {client.needsAttention && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="h-3 w-3" />
                          {client.province} • {client.caseType}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusBadgeColor(client.status)}>
                          {client.status}
                        </Badge>
                        <Badge className={getRiskBadgeColor(client.riskLevel)}>
                          {client.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {client.documents} docs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last contact: {client.lastContact}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm">View Case</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Vault */}
          <DocumentVault />
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeCRMPage;
