
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Search, Filter } from "lucide-react";
import { EnhancedFileUpload } from "@/components/FileUpload/EnhancedFileUpload";
import { useDocuments } from "./hooks/useDocuments";
import { DocumentGrid } from "./components/DocumentGrid";
import { SearchBar } from "./SearchBar";
import { toast } from "sonner";

export const DocumentManagement = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { documents, isLoading, refetch } = useDocuments();

  useEffect(() => {
    console.log("DocumentManagement loaded successfully");
  }, []);

  const handleUploadSuccess = () => {
    toast.success("Document uploaded successfully");
    refetch();
    setUploadDialogOpen(false);
  };

  const filteredDocuments = documents?.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.metadata?.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Manage and organize your documents with AI-powered analysis
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search documents..."
        />
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({filteredDocuments.length})
            </CardTitle>
            <CardDescription>
              View and manage all uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentGrid documents={filteredDocuments} />
          </CardContent>
        </Card>
      </div>

      {uploadDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload Documents</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setUploadDialogOpen(false)}
              >
                ×
              </Button>
            </div>
            <EnhancedFileUpload 
              onUploadSuccess={handleUploadSuccess}
              onError={(error) => toast.error(error)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
