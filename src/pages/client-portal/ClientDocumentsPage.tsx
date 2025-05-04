
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { StatusBadge } from "@/components/client-portal/StatusBadge";
import { useState } from "react";
import { FileText, FileUp, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthState } from "@/hooks/useAuthState";

export const ClientDocumentsPage = () => {
  const { user } = useAuthState();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in a real implementation, this would come from your database
  const documents = [
    { id: "1", title: "Form 47 - Consumer Proposal", date: "2025-04-12", status: "Complete", category: "Filing" },
    { id: "2", title: "Income Verification", date: "2025-04-10", status: "Incomplete", category: "Financial" },
    { id: "3", title: "Form 65 - Monthly Income and Expense Statement", date: "2025-05-01", status: "Pending Review", category: "Reporting" },
    { id: "4", title: "Bank Statement - April 2025", date: "2025-05-05", status: "Complete", category: "Financial" },
    { id: "5", title: "Asset Declaration Form", date: "2025-04-15", status: "Complete", category: "Filing" }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === "all" || doc.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUploadComplete = (documentId: string) => {
    console.log(`Document ${documentId} upload completed`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Documents</h1>
          <p className="text-muted-foreground">View and manage all your estate documents</p>
        </div>
        <Button className="gap-2">
          <FileUp className="h-4 w-4" />
          <span>Upload New Document</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Upload Required Documents</CardTitle>
          <CardDescription>
            Upload any missing or requested documents for your case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Documents</SelectItem>
            <SelectItem value="filing">Filing Forms</SelectItem>
            <SelectItem value="financial">Financial Documents</SelectItem>
            <SelectItem value="reporting">Reporting Forms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} documents available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="flex items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <div className="mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">Uploaded on {new Date(doc.date).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={doc.status} size="md" />
                <Button variant="ghost" size="sm" className="ml-2">View</Button>
              </div>
            ))}
            {filteredDocuments.length === 0 && (
              <div className="text-center p-6">
                <p className="text-muted-foreground">No documents match your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDocumentsPage;
