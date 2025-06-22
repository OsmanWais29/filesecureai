
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Upload, 
  Search, 
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  uploadDate: string;
  size: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const DocumentVault = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const documents: Document[] = [
    {
      id: "1",
      name: "Consumer Proposal - Form 47",
      type: "Legal Document",
      status: "approved",
      uploadDate: "2024-06-20",
      size: "2.3 MB",
      riskLevel: "low"
    },
    {
      id: "2", 
      name: "Financial Statement",
      type: "Financial",
      status: "pending",
      uploadDate: "2024-06-19",
      size: "1.8 MB",
      riskLevel: "medium"
    },
    {
      id: "3",
      name: "Bankruptcy Assignment",
      type: "Legal Document", 
      status: "reviewed",
      uploadDate: "2024-06-18",
      size: "3.1 MB",
      riskLevel: "high"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Vault
          </CardTitle>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search documents..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{doc.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{doc.type} • {doc.size}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(doc.status)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadgeVariant(doc.status)} className="text-xs">
                      {doc.status}
                    </Badge>
                    <Badge variant={getRiskBadgeVariant(doc.riskLevel)} className="text-xs">
                      {doc.riskLevel} risk
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Uploaded: {doc.uploadDate}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
