
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Upload,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileBarChart
} from "lucide-react";

const TrusteeDocumentsPage = () => {
  const documents = [
    {
      id: "1",
      name: "Form 47 - Consumer Proposal",
      client: "John Smith",
      type: "Consumer Proposal",
      status: "Analyzed",
      riskLevel: "Low",
      uploadDate: "2024-06-20",
      analysisComplete: true
    },
    {
      id: "2", 
      name: "Form 65 - Assignment in Bankruptcy",
      client: "Sarah Johnson",
      type: "Bankruptcy",
      status: "Processing", 
      riskLevel: "High",
      uploadDate: "2024-06-19",
      analysisComplete: false
    },
    {
      id: "3",
      name: "Financial Statements",
      client: "Mike Wilson",
      type: "Financial",
      status: "Review Required",
      riskLevel: "Medium", 
      uploadDate: "2024-06-18",
      analysisComplete: true
    }
  ];

  const stats = [
    { title: "Total Documents", value: "1,247", icon: FileText },
    { title: "Pending Analysis", value: "23", icon: Clock },
    { title: "High Risk Detected", value: "8", icon: AlertTriangle },
    { title: "Analysis Complete", value: "1,216", icon: CheckCircle }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Analyzed": return "bg-green-100 text-green-800";
      case "Processing": return "bg-blue-100 text-blue-800";
      case "Review Required": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Analysis Center</h1>
            <p className="text-gray-600 mt-1">AI-powered document processing and risk assessment for all bankruptcy forms.</p>
          </div>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search documents by name, client, or form type..." 
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

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h3 className="font-medium">{doc.name}</h3>
                        {doc.analysisComplete && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Client: {doc.client}</p>
                      <p className="text-sm text-gray-600 mb-2">Type: {doc.type}</p>
                      <p className="text-xs text-gray-500">Uploaded: {doc.uploadDate}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      <Badge className={getRiskColor(doc.riskLevel)}>
                        {doc.riskLevel} Risk
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileBarChart className="h-3 w-3 mr-1" />
                      Risk Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeDocumentsPage;
