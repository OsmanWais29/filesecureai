
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  MessageSquare,
  Edit
} from "lucide-react";

const TrusteeClientViewerPage = () => {
  const { clientId } = useParams();

  // Mock client data - in real app this would come from API
  const client = {
    id: clientId,
    name: "John Smith",
    email: "john.smith@email.com", 
    phone: "(555) 123-4567",
    address: "123 Main Street, Toronto, ON M5V 3A8",
    caseType: "Consumer Proposal",
    status: "Active",
    riskLevel: "Medium",
    dateAdded: "2024-03-15",
    lastContact: "2024-06-20",
    totalDebt: "$45,000",
    monthlyIncome: "$3,200",
    monthlyExpenses: "$2,800"
  };

  const documents = [
    { name: "Form 47 - Consumer Proposal", date: "2024-06-20", status: "Completed" },
    { name: "Financial Statements", date: "2024-06-18", status: "Under Review" },
    { name: "Income Verification", date: "2024-06-15", status: "Completed" }
  ];

  const activities = [
    { type: "meeting", description: "Initial consultation completed", date: "2024-06-20", time: "10:00 AM" },
    { type: "document", description: "Form 47 submitted", date: "2024-06-18", time: "2:30 PM" },
    { type: "call", description: "Follow-up call - discussed payment plan", date: "2024-06-15", time: "11:15 AM" }
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
      case "Completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client ID: {client.id} • {client.caseType}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact
            </Button>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Client Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Added: {client.dateAdded}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Debt:</span>
                <span className="font-medium">{client.totalDebt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Income:</span>
                <span className="font-medium">{client.monthlyIncome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Expenses:</span>
                <span className="font-medium">{client.monthlyExpenses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Surplus:</span>
                <span className="font-medium text-green-600">$400</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Case Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
              </div>
              <div className="flex justify-between"> 
                <span className="text-sm text-gray-600">Risk Level:</span>
                <Badge className={getRiskColor(client.riskLevel)}>
                  {client.riskLevel} Risk
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Contact:</span>
                <span className="text-sm">{client.lastContact}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.date}</p>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}  
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full ${
                      activity.type === 'meeting' ? 'bg-blue-100' :
                      activity.type === 'document' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      {activity.type === 'meeting' ? <Calendar className="h-3 w-3" /> :
                       activity.type === 'document' ? <FileText className="h-3 w-3" /> :
                       <Phone className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.date} at {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeClientViewerPage;
