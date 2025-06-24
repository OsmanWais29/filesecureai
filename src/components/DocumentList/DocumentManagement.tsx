
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Search, Filter, AlertCircle } from "lucide-react";
import { EnhancedFileUpload } from "@/components/FileUpload/EnhancedFileUpload";
import { useDocuments } from "./hooks/useDocuments";
import { DocumentGrid } from "./components/DocumentGrid";
import { SearchBar } from "./SearchBar";
import { toast } from "sonner";

export const DocumentManagement = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  const { documents, isLoading, error, refetch } = useDocuments();

  useEffect(() => {
    console.log("DocumentManagement loaded successfully");
    console.log("Documents state:", { documents, isLoading, error });
    
    // Add debug information
    const debug = `
      Documents: ${documents?.length || 0}
      Loading: ${isLoading}
      Error: ${error?.message || 'none'}
      Route: ${window.location.pathname}
    `;
    setDebugInfo(debug);
  }, [documents, isLoading, error]);

  const handleUploadComplete = (documentId: string) => {
    console.log("Upload completed:", documentId);
    toast.success("Document uploaded successfully");
    refetch();
    setUploadDialogOpen(false);
  };

  const handleDocumentClick = (document: { id: string; title: string; storage_path: string }) => {
    console.log("Document clicked:", document);
    toast.info(`Clicked: ${document.title}`);
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight text-destructive">Error Loading Documents</h1>
          <p className="text-muted-foreground">{error.message}</p>
          <div className="bg-muted p-4 rounded-lg text-left text-sm">
            <pre>{debugInfo}</pre>
          </div>
          <div className="space-x-2">
            <Button onClick={refetch}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredDocuments = documents?.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.metadata?.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group documents by client name for the DocumentGrid
  const groupedByClient = filteredDocuments.reduce((acc, doc) => {
    const clientName = doc.metadata?.client_name || 'Uncategorized';
    if (!acc[clientName]) {
      acc[clientName] = {
        documents: [],
        lastUpdated: null,
        types: new Set<string>()
      };
    }
    acc[clientName].documents.push(doc);
    acc[clientName].types.add(doc.type || 'Unknown');
    const docDate = new Date(doc.updated_at);
    if (!acc[clientName].lastUpdated || docDate > acc[clientName].lastUpdated) {
      acc[clientName].lastUpdated = docDate;
    }
    return acc;
  }, {} as Record<string, { documents: any[], lastUpdated: Date | null, types: Set<string> }>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading documents...</span>
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

      {/* Debug Panel - Remove in production */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs">{debugInfo}</pre>
          <div className="mt-2 space-x-2">
            <Button size="sm" variant="outline" onClick={() => console.log("Current state:", { documents, isLoading, error })}>
              Log State
            </Button>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Refetch Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">No documents found</h3>
                <p className="text-muted-foreground">
                  {documents === null ? "Failed to load documents" : "Upload your first document to get started"}
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <DocumentGrid 
                isGridView={true}
                groupedByClient={groupedByClient}
                selectedFolder={selectedFolder}
                onFolderSelect={setSelectedFolder}
                onDocumentClick={handleDocumentClick}
              />
            )}
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
              onUploadComplete={handleUploadComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};
