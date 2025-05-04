import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { Document } from "@/components/DocumentList/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, FileText, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export const ClientDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState("required");
  const [isUploading, setIsUploading] = useState(false);

  // Simulate upload completion handler
  const handleUploadComplete = async (documentId: string) => {
    // In a real implementation, we would fetch the updated document from the API
    toast.success("Document uploaded successfully");
    
    // Simulate adding the new document to the list
    const newDoc: Document = {
      id: documentId,
      title: "Newly Uploaded Document",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      storage_path: `/documents/${documentId}`,
      type: "pdf",
      size: 1024 * 1024, // 1MB sample size
    };
    
    setDocuments([...documents, newDoc]);
    setIsUploading(false);
  };

  // Placeholder document categories for demonstration
  const documentCategories = [
    { id: "required", label: "Required Documents", count: 4 },
    { id: "submitted", label: "Submitted", count: documents.length },
    { id: "reviewed", label: "Reviewed", count: 0 }
  ];

  const requiredDocuments = [
    { id: "1", name: "Proof of Income", description: "Recent pay stubs or income statements", status: "required" },
    { id: "2", name: "Bank Statements", description: "Last 3 months of all bank accounts", status: "required" },
    { id: "3", name: "Tax Returns", description: "Most recent tax return", status: "required" },
    { id: "4", name: "Credit Card Statements", description: "Last 3 months for all credit cards", status: "required" }
  ];

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Button 
          onClick={() => setIsUploading(true)} 
          className="flex items-center gap-2"
        >
          <UploadCloud className="h-4 w-4" />
          Upload Document
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Upload and manage the documents required for your case. Your trustee will review these documents.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          {documentCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.label}
              <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
                {category.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="required">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {requiredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {doc.name}
                  </CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm" variant="outline" className="w-full">
                    Upload Document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submitted">
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <File className="h-5 w-5 text-green-500" />
                      {doc.title}
                    </CardTitle>
                    <CardDescription>
                      Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {(doc.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents submitted yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload the required documents to proceed with your case
              </p>
              <Button 
                onClick={() => setIsUploading(true)}
                className="flex items-center gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Document
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reviewed documents yet</h3>
            <p className="text-muted-foreground">
              Your trustee will review your documents after submission
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {isUploading && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload the required documents for your case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
