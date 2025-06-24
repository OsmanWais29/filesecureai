
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Eye, 
  Upload,
  Shield,
  Clock
} from "lucide-react";

export const DocumentVault = () => {
  const documents = [
    {
      id: "1",
      name: "Form 47 - Consumer Proposal",
      client: "Josh Hart",
      uploadDate: "2024-06-20",
      status: "Processed",
      riskLevel: "Low",
      size: "2.4 MB"
    },
    {
      id: "2", 
      name: "Form 65 - Assignment in Bankruptcy",
      client: "Sarah Johnson",
      uploadDate: "2024-06-18",
      status: "Under Review",
      riskLevel: "High",
      size: "1.8 MB"
    },
    {
      id: "3",
      name: "Financial Statements",
      client: "Michael Chen", 
      uploadDate: "2024-06-15",
      status: "Approved",
      riskLevel: "Medium",
      size: "3.2 MB"
    }
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Processed": return "bg-green-100 text-green-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Approved": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Document Vault
          </CardTitle>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">{doc.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Client: {doc.client}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {doc.uploadDate}
                    </span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusBadgeColor(doc.status)}>
                    {doc.status}
                  </Badge>
                  <Badge className={getRiskBadgeColor(doc.riskLevel)}>
                    {doc.riskLevel} Risk
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  View
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
  );
};
